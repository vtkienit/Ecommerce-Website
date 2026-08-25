package com.ecommerce.catalog.services;

import com.ecommerce.catalog.dtos.AdminProductResponse;
import com.ecommerce.catalog.dtos.AdminVariantResponse;
import com.ecommerce.catalog.dtos.CategoryResponse;
import com.ecommerce.catalog.dtos.CategoryUpsertRequest;
import com.ecommerce.catalog.dtos.ImageUpsertRequest;
import com.ecommerce.catalog.dtos.PageResponse;
import com.ecommerce.catalog.dtos.ProductImageResponse;
import com.ecommerce.catalog.dtos.ProductUpsertRequest;
import com.ecommerce.catalog.dtos.VariantUpsertRequest;
import com.ecommerce.catalog.entities.Product;
import com.ecommerce.catalog.entities.ProductCategory;
import com.ecommerce.catalog.entities.ProductImage;
import com.ecommerce.catalog.entities.ProductVariant;
import com.ecommerce.catalog.exceptions.CatalogException;
import com.ecommerce.catalog.repositories.FlashSaleItemRepository;
import com.ecommerce.catalog.repositories.ProductCategoryRepository;
import com.ecommerce.catalog.repositories.ProductImageRepository;
import com.ecommerce.catalog.repositories.ProductRepository;
import com.ecommerce.catalog.repositories.ProductVariantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class CatalogAdminService {

    private static final int MAX_IMAGES_PER_PRODUCT = 10;

    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final FlashSaleItemRepository flashSaleItemRepository;
    private final SupabaseStorageService storageService;

    public CatalogAdminService(
            ProductCategoryRepository categoryRepository,
            ProductRepository productRepository,
            ProductVariantRepository variantRepository,
            ProductImageRepository imageRepository,
            FlashSaleItemRepository flashSaleItemRepository,
            SupabaseStorageService storageService
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.imageRepository = imageRepository;
        this.flashSaleItemRepository = flashSaleItemRepository;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAllSummaries();
    }

    public CategoryResponse createCategory(CategoryUpsertRequest request) {
        String name = request.getName().trim();
        String slug = resolveSlug(request.getSlug(), name);
        validateCategoryUniqueness(name, slug, null);

        ProductCategory category = new ProductCategory();
        category.setName(name);
        category.setSlug(slug);
        return toCategoryResponse(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(Long id, CategoryUpsertRequest request) {
        ProductCategory category = findCategory(id);
        String name = request.getName().trim();
        String slug = resolveSlug(request.getSlug(), name);
        validateCategoryUniqueness(name, slug, id);

        category.setName(name);
        category.setSlug(slug);
        return toCategoryResponse(category);
    }

    public void deleteCategory(Long id) {
        ProductCategory category = findCategory(id);
        if (productRepository.countByProductCategoryId(id) > 0) {
            throw new CatalogException(
                    "Delete or move the products in this category first",
                    HttpStatus.CONFLICT
            );
        }
        categoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminProductResponse> getProducts(int page, int size, String search) {
        Specification<Product> specification = (root, query, builder) -> {
            if (search == null || search.isBlank()) return builder.conjunction();

            String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            return builder.or(
                    builder.like(builder.lower(root.get("name")), keyword),
                    builder.like(builder.lower(root.get("slug")), keyword),
                    builder.like(builder.lower(root.get("brand")), keyword),
                    builder.like(builder.lower(root.get("productCategory").get("name")), keyword)
            );
        };
        Page<Product> products = productRepository.findAll(
                specification,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))
        );
        return new PageResponse<>(
                products.getContent().stream().map(this::toProductResponse).toList(),
                products.getNumber(),
                products.getSize(),
                products.getTotalElements(),
                products.getTotalPages(),
                products.isFirst(),
                products.isLast()
        );
    }

    public AdminProductResponse createProduct(ProductUpsertRequest request) {
        String name = request.getName().trim();
        String slug = resolveSlug(request.getSlug(), name);
        validateProductSlug(slug, null);

        Product product = new Product();
        updateProductFields(product, request, name, slug);
        return toProductResponse(productRepository.save(product));
    }

    public AdminProductResponse updateProduct(Long id, ProductUpsertRequest request) {
        Product product = findProduct(id);
        String name = request.getName().trim();
        String slug = resolveSlug(request.getSlug(), name);
        validateProductSlug(slug, id);

        updateProductFields(product, request, name, slug);
        return toProductResponse(product);
    }

    public void deleteProduct(Long id) {
        Product product = findProduct(id);
        if (flashSaleItemRepository.existsByProductVariantProductId(id)) {
            throw new CatalogException(
                    "Remove this product from flash sales before deleting it",
                    HttpStatus.CONFLICT
            );
        }
        List<String> imageUrls = product.getImages().stream().map(ProductImage::getImageUrl).toList();
        productRepository.delete(product);
        productRepository.flush();
        imageUrls.forEach(storageService::deleteByUrl);
    }

    public AdminProductResponse createVariant(Long productId, VariantUpsertRequest request) {
        Product product = findProduct(productId);
        String sku = normalizeSku(request.getSku());
        validateVariantSku(sku, null);

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        updateVariantFields(variant, request, sku);
        product.getVariants().add(variant);
        variantRepository.save(variant);
        return toProductResponse(product);
    }

    public AdminProductResponse updateVariant(Long id, VariantUpsertRequest request) {
        ProductVariant variant = findVariant(id);
        String sku = normalizeSku(request.getSku());
        validateVariantSku(sku, id);

        updateVariantFields(variant, request, sku);
        return toProductResponse(variant.getProduct());
    }

    public AdminProductResponse deleteVariant(Long id) {
        ProductVariant variant = findVariant(id);
        if (flashSaleItemRepository.existsByProductVariantId(id)) {
            throw new CatalogException(
                    "Remove this variant from flash sales before deleting it",
                    HttpStatus.CONFLICT
            );
        }

        Product product = variant.getProduct();
        product.getVariants().remove(variant);
        variantRepository.delete(variant);
        return toProductResponse(product);
    }

    public AdminProductResponse createImage(Long productId, ImageUpsertRequest request) {
        Product product = findProduct(productId);
        boolean primary = request.isPrimary() || product.getImages().isEmpty();
        if (primary) {
            clearPrimaryImage(product);
        }

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(request.getImageUrl().trim());
        image.setPrimaryImage(primary);
        product.getImages().add(image);
        imageRepository.save(image);
        return toProductResponse(product);
    }

    public AdminProductResponse uploadImages(
            Long productId,
            MultipartFile primaryImage,
            List<MultipartFile> secondaryImages
    ) {
        Product product = findProduct(productId);
        List<MultipartFile> secondary = secondaryImages == null
                ? List.of()
                : secondaryImages.stream().filter(file -> !file.isEmpty()).toList();
        boolean hasPrimary = primaryImage != null && !primaryImage.isEmpty();
        int uploadCount = secondary.size() + (hasPrimary ? 1 : 0);

        if (uploadCount == 0) {
            throw new CatalogException("Please select at least one image", HttpStatus.BAD_REQUEST);
        }
        if (product.getImages().size() + uploadCount > MAX_IMAGES_PER_PRODUCT) {
            throw new CatalogException(
                    "A product can have at most " + MAX_IMAGES_PER_PRODUCT + " images",
                    HttpStatus.BAD_REQUEST
            );
        }

        List<String> uploadedUrls = new ArrayList<>();
        try {
            if (hasPrimary) {
                uploadedUrls.add(storageService.uploadProductImage(productId, primaryImage));
            }
            for (MultipartFile file : secondary) {
                uploadedUrls.add(storageService.uploadProductImage(productId, file));
            }

            boolean needsPrimary = hasPrimary || product.getImages().isEmpty();
            if (hasPrimary) {
                clearPrimaryImage(product);
            }

            List<ProductImage> uploadedImages = new ArrayList<>();
            for (int index = 0; index < uploadedUrls.size(); index++) {
                ProductImage image = new ProductImage();
                image.setProduct(product);
                image.setImageUrl(uploadedUrls.get(index));
                image.setPrimaryImage(needsPrimary && index == 0);
                product.getImages().add(image);
                uploadedImages.add(image);
            }
            imageRepository.saveAll(uploadedImages);
            imageRepository.flush();
            return toProductResponse(product);
        } catch (RuntimeException exception) {
            storageService.deleteUploadedFiles(uploadedUrls);
            throw exception;
        }
    }

    public AdminProductResponse updateImage(Long id, ImageUpsertRequest request) {
        ProductImage image = findImage(id);
        Product product = image.getProduct();
        String previousUrl = image.getImageUrl();
        image.setImageUrl(request.getImageUrl().trim());

        if (request.isPrimary()) {
            clearPrimaryImage(product);
            image.setPrimaryImage(true);
        } else if (image.isPrimaryImage()) {
            image.setPrimaryImage(false);
            product.getImages()
                    .stream()
                    .filter(candidate -> !candidate.getId().equals(id))
                    .min(Comparator.comparing(ProductImage::getId))
                    .ifPresentOrElse(
                            candidate -> candidate.setPrimaryImage(true),
                            () -> image.setPrimaryImage(true)
                    );
        }

        imageRepository.flush();
        if (!previousUrl.equals(image.getImageUrl())) {
            storageService.deleteByUrl(previousUrl);
        }
        return toProductResponse(product);
    }

    public AdminProductResponse deleteImage(Long id) {
        ProductImage image = findImage(id);
        Product product = image.getProduct();
        boolean wasPrimary = image.isPrimaryImage();

        product.getImages().remove(image);
        imageRepository.delete(image);
        if (wasPrimary) {
            product.getImages()
                    .stream()
                    .min(Comparator.comparing(ProductImage::getId))
                    .ifPresent(candidate -> candidate.setPrimaryImage(true));
        }
        imageRepository.flush();
        storageService.deleteByUrl(image.getImageUrl());
        return toProductResponse(product);
    }

    private void updateProductFields(
            Product product,
            ProductUpsertRequest request,
            String name,
            String slug
    ) {
        product.setProductCategory(findCategory(request.getCategoryId()));
        product.setName(name);
        product.setSlug(slug);
        product.setBrand(cleanNullable(request.getBrand()));
        product.setDescription(cleanNullable(request.getDescription()));
    }

    private void updateVariantFields(
            ProductVariant variant,
            VariantUpsertRequest request,
            String sku
    ) {
        variant.setSku(sku);
        variant.setSize(cleanNullable(request.getSize()));
        variant.setThickness(cleanNullable(request.getThickness()));
        variant.setColor(cleanNullable(request.getColor()));
        variant.setPrice(request.getPrice());
    }

    private void validateCategoryUniqueness(String name, String slug, Long id) {
        boolean duplicateName = id == null
                ? categoryRepository.existsByNameIgnoreCase(name)
                : categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id);
        boolean duplicateSlug = id == null
                ? categoryRepository.existsBySlugIgnoreCase(slug)
                : categoryRepository.existsBySlugIgnoreCaseAndIdNot(slug, id);

        if (duplicateName) {
            throw new CatalogException("Category name already exists", HttpStatus.CONFLICT);
        }
        if (duplicateSlug) {
            throw new CatalogException("Category slug already exists", HttpStatus.CONFLICT);
        }
    }

    private void validateProductSlug(String slug, Long id) {
        boolean duplicate = id == null
                ? productRepository.existsBySlugIgnoreCase(slug)
                : productRepository.existsBySlugIgnoreCaseAndIdNot(slug, id);
        if (duplicate) {
            throw new CatalogException("Product slug already exists", HttpStatus.CONFLICT);
        }
    }

    private void validateVariantSku(String sku, Long id) {
        boolean duplicate = id == null
                ? variantRepository.existsBySkuIgnoreCase(sku)
                : variantRepository.existsBySkuIgnoreCaseAndIdNot(sku, id);
        if (duplicate) {
            throw new CatalogException("SKU already exists", HttpStatus.CONFLICT);
        }
    }

    private ProductCategory findCategory(Long id) {
        return categoryRepository
                .findById(id)
                .orElseThrow(() -> new CatalogException("Category not found", HttpStatus.NOT_FOUND));
    }

    private Product findProduct(Long id) {
        return productRepository
                .findById(id)
                .orElseThrow(() -> new CatalogException("Product not found", HttpStatus.NOT_FOUND));
    }

    private ProductVariant findVariant(Long id) {
        return variantRepository
                .findById(id)
                .orElseThrow(() -> new CatalogException("Product variant not found", HttpStatus.NOT_FOUND));
    }

    private ProductImage findImage(Long id) {
        return imageRepository
                .findById(id)
                .orElseThrow(() -> new CatalogException("Product image not found", HttpStatus.NOT_FOUND));
    }

    private CategoryResponse toCategoryResponse(ProductCategory category) {
        return new CategoryResponse(
                category.getId(),
                category.getSlug(),
                category.getName(),
                productRepository.countByProductCategoryId(category.getId())
        );
    }

    private AdminProductResponse toProductResponse(Product product) {
        List<AdminVariantResponse> variants = product
                .getVariants()
                .stream()
                .sorted(Comparator.comparing(ProductVariant::getId))
                .map(variant -> new AdminVariantResponse(
                        variant.getId(),
                        variant.getSku(),
                        variant.getSize(),
                        variant.getThickness(),
                        variant.getColor(),
                        variant.getPrice()
                ))
                .toList();
        List<ProductImageResponse> images = product
                .getImages()
                .stream()
                .sorted(Comparator
                        .comparing(ProductImage::isPrimaryImage)
                        .reversed()
                        .thenComparing(ProductImage::getId))
                .map(image -> new ProductImageResponse(
                        image.getId(),
                        image.getImageUrl(),
                        image.isPrimaryImage()
                ))
                .toList();

        return new AdminProductResponse(
                product.getId(),
                product.getProductCategory().getId(),
                product.getProductCategory().getName(),
                product.getName(),
                product.getSlug(),
                product.getBrand(),
                product.getDescription(),
                variants,
                images
        );
    }

    private void clearPrimaryImage(Product product) {
        product.getImages().forEach(image -> image.setPrimaryImage(false));
    }

    private String resolveSlug(String requestedSlug, String fallback) {
        String source = requestedSlug == null || requestedSlug.isBlank()
                ? fallback
                : requestedSlug;
        String slug = Normalizer
                .normalize(source, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        if (slug.isBlank()) {
            throw new CatalogException("Slug is invalid", HttpStatus.BAD_REQUEST);
        }
        return slug;
    }

    private String normalizeSku(String sku) {
        return sku.trim().toUpperCase(Locale.ROOT);
    }

    private String cleanNullable(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
