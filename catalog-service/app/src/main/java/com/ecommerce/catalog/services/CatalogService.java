package com.ecommerce.catalog.services;

import com.ecommerce.catalog.dtos.*;
import com.ecommerce.catalog.entities.*;
import com.ecommerce.catalog.exceptions.CatalogException;
import com.ecommerce.catalog.repositories.FlashSaleRepository;
import com.ecommerce.catalog.repositories.ProductCategoryRepository;
import com.ecommerce.catalog.repositories.ProductRepository;
import com.ecommerce.catalog.repositories.ProductVariantRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private static final String DEFAULT_SORT = "newest,desc";
    private static final Set<String> ALLOWED_SORTS = Set.of(
            DEFAULT_SORT,
            "name,asc",
            "name,desc",
            "price,asc",
            "price,desc"
    );

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final FlashSaleRepository flashSaleRepository;
    private final ProductVariantRepository variantRepository;

    public CatalogService(
            ProductRepository productRepository,
            ProductCategoryRepository categoryRepository,
            FlashSaleRepository flashSaleRepository,
            ProductVariantRepository variantRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.flashSaleRepository = flashSaleRepository;
        this.variantRepository = variantRepository;
    }

    public List<CategoryResponse> getCategories() {
        return categoryRepository
                .findAllByOrderByNameAsc()
                .stream()
                .map(category -> new CategoryResponse(
                        category.getId(),
                        category.getSlug(),
                        category.getName(),
                        productRepository.countByProductCategoryId(category.getId())
                ))
                .toList();
    }

    public PageResponse<ProductSummaryResponse> getProducts(ProductSearchCriteria criteria) {
        validateCriteria(criteria);

        String sort = normalizeSort(criteria.getSort());
        Pageable pageable = PageRequest.of(
                criteria.getPage(),
                criteria.getSize(),
                createSort(sort)
        );

        Page<Product> products = productRepository.findAll(
                createSpecification(criteria, sort),
                pageable
        );
        Map<Long, FlashSaleItem> discounts = getActiveDiscounts(LocalDateTime.now());

        return new PageResponse<>(
                products.getContent()
                        .stream()
                        .map(product -> toSummary(product, discounts))
                        .toList(),
                products.getNumber(),
                products.getSize(),
                products.getTotalElements(),
                products.getTotalPages(),
                products.isFirst(),
                products.isLast()
        );
    }

    public ProductDetailResponse getProduct(String slug) {
        Product product = productRepository
                .findBySlugIgnoreCase(slug.trim())
                .orElseThrow(() -> new CatalogException("Product not found", HttpStatus.NOT_FOUND));
        Map<Long, FlashSaleItem> discounts = getActiveDiscounts(LocalDateTime.now());
        ProductSummaryResponse summary = toSummary(product, discounts);

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

        List<ProductVariantResponse> variants = product
                .getVariants()
                .stream()
                .sorted(Comparator.comparing(ProductVariant::getPrice))
                .map(variant -> toVariant(variant, discounts.get(variant.getId())))
                .toList();

        List<ProductSummaryResponse> relatedProducts = productRepository
                .findTop5ByProductCategoryIdAndIdNotOrderByIdDesc(
                        product.getProductCategory().getId(),
                        product.getId()
                )
                .stream()
                .limit(4)
                .map(related -> toSummary(related, discounts))
                .toList();

        return new ProductDetailResponse(
                product.getId(),
                product.getSlug(),
                product.getName(),
                product.getBrand(),
                product.getDescription(),
                product.getProductCategory().getSlug(),
                product.getProductCategory().getName(),
                summary.getPrice(),
                summary.getOriginalPrice(),
                summary.getDiscountPercentage(),
                images,
                variants,
                relatedProducts
        );
    }

    public CatalogVariantResponse getVariant(Long id) {
        ProductVariant variant = variantRepository
                .findWithProductById(id)
                .orElseThrow(() -> new CatalogException("Product variant not found", HttpStatus.NOT_FOUND));
        return toCatalogVariant(variant, getActiveDiscounts(LocalDateTime.now()));
    }

    public List<CatalogVariantResponse> getVariants() {
        Map<Long, FlashSaleItem> discounts = getActiveDiscounts(LocalDateTime.now());
        return variantRepository
                .findAllWithProduct()
                .stream()
                .map(variant -> toCatalogVariant(variant, discounts))
                .toList();
    }

    private CatalogVariantResponse toCatalogVariant(
            ProductVariant variant,
            Map<Long, FlashSaleItem> discounts
    ) {
        Product product = variant.getProduct();
        FlashSaleItem discount = discounts.get(variant.getId());
        ProductVariantResponse price = toVariant(variant, discount);
        String imageUrl = product
                .getImages()
                .stream()
                .filter(ProductImage::isPrimaryImage)
                .findFirst()
                .or(() -> product.getImages().stream().findFirst())
                .map(ProductImage::getImageUrl)
                .orElse(null);

        return new CatalogVariantResponse(
                variant.getId(),
                product.getSlug(),
                product.getName(),
                imageUrl,
                variant.getSku(),
                variant.getSize(),
                variant.getThickness(),
                variant.getColor(),
                price.getOriginalPrice(),
                price.getPrice(),
                price.getDiscountPercentage()
        );
    }

    public Optional<FlashSaleResponse> getCurrentFlashSale() {
        LocalDateTime now = LocalDateTime.now();
        List<FlashSale> activeSales = flashSaleRepository.findActiveAt(now);

        if (activeSales.isEmpty()) {
            return Optional.empty();
        }

        FlashSale flashSale = activeSales.getFirst();
        Map<Long, FlashSaleItem> discounts = getActiveDiscounts(activeSales);
        Map<Long, Product> products = flashSale
                .getItems()
                .stream()
                .map(item -> item.getProductVariant().getProduct())
                .collect(Collectors.toMap(
                        Product::getId,
                        Function.identity(),
                        (existing, ignored) -> existing,
                        LinkedHashMap::new
                ));

        return Optional.of(new FlashSaleResponse(
                flashSale.getId(),
                flashSale.getName(),
                flashSale.getDescription(),
                flashSale.getStartDate(),
                flashSale.getEndDate(),
                products.values()
                        .stream()
                        .map(product -> toSummary(product, discounts))
                        .toList()
        ));
    }

    private Specification<Product> createSpecification(
            ProductSearchCriteria criteria,
            String sort
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (hasText(criteria.getCategory())) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("productCategory").get("slug")),
                        criteria.getCategory().trim().toLowerCase(Locale.ROOT)
                ));
            }

            if (hasText(criteria.getSearch())) {
                String search = "%" + criteria.getSearch().trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), search),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("brand")), search),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), search)
                ));
            }

            if (hasVariantFilters(criteria)) {
                Subquery<Long> variantQuery = query.subquery(Long.class);
                Root<ProductVariant> variant = variantQuery.from(ProductVariant.class);
                List<Predicate> variantPredicates = new ArrayList<>();

                variantPredicates.add(criteriaBuilder.equal(variant.get("product"), root));

                if (criteria.getMinPrice() != null) {
                    variantPredicates.add(criteriaBuilder.greaterThanOrEqualTo(
                            variant.get("price"),
                            criteria.getMinPrice()
                    ));
                }

                if (criteria.getMaxPrice() != null) {
                    variantPredicates.add(criteriaBuilder.lessThanOrEqualTo(
                            variant.get("price"),
                            criteria.getMaxPrice()
                    ));
                }

                if (!criteria.getSizes().isEmpty()) {
                    variantPredicates.add(criteriaBuilder.lower(variant.<String>get("size"))
                            .in(normalizeValues(criteria.getSizes())));
                }

                if (!criteria.getColors().isEmpty()) {
                    variantPredicates.add(criteriaBuilder.lower(variant.<String>get("color"))
                            .in(normalizeValues(criteria.getColors())));
                }

                variantQuery
                        .select(variant.get("id"))
                        .where(variantPredicates.toArray(Predicate[]::new));
                predicates.add(criteriaBuilder.exists(variantQuery));
            }

            if (sort.startsWith("price,") && query.getResultType() != Long.class) {
                Subquery<BigDecimal> priceQuery = query.subquery(BigDecimal.class);
                Root<ProductVariant> variant = priceQuery.from(ProductVariant.class);
                priceQuery
                        .select(criteriaBuilder.min(variant.<BigDecimal>get("price")))
                        .where(criteriaBuilder.equal(variant.get("product"), root));

                query.orderBy(
                        sort.endsWith("asc")
                                ? criteriaBuilder.asc(priceQuery)
                                : criteriaBuilder.desc(priceQuery),
                        criteriaBuilder.desc(root.get("id"))
                );
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private ProductSummaryResponse toSummary(
            Product product,
            Map<Long, FlashSaleItem> discounts
    ) {
        VariantPrice lowestPrice = product
                .getVariants()
                .stream()
                .map(variant -> calculatePrice(variant, discounts.get(variant.getId())))
                .min(Comparator.comparing(VariantPrice::getPrice))
                .orElse(new VariantPrice(BigDecimal.ZERO, BigDecimal.ZERO, null));

        String imageUrl = product
                .getImages()
                .stream()
                .filter(ProductImage::isPrimaryImage)
                .findFirst()
                .or(() -> product.getImages().stream().findFirst())
                .map(ProductImage::getImageUrl)
                .orElse(null);

        int numberSizes = (int) product
                .getVariants()
                .stream()
                .map(ProductVariant::getSize)
                .filter(this::hasText)
                .distinct()
                .count();
        int numberColors = (int) product
                .getVariants()
                .stream()
                .map(ProductVariant::getColor)
                .filter(this::hasText)
                .distinct()
                .count();

        return new ProductSummaryResponse(
                product.getId(),
                product.getSlug(),
                product.getName(),
                product.getBrand(),
                product.getProductCategory().getSlug(),
                product.getProductCategory().getName(),
                imageUrl,
                lowestPrice.getPrice(),
                lowestPrice.getDiscountPercentage() == null
                        ? null
                        : lowestPrice.getOriginalPrice(),
                lowestPrice.getDiscountPercentage(),
                numberSizes,
                numberColors
        );
    }

    private ProductVariantResponse toVariant(
            ProductVariant variant,
            FlashSaleItem discount
    ) {
        VariantPrice price = calculatePrice(variant, discount);

        return new ProductVariantResponse(
                variant.getId(),
                variant.getSku(),
                variant.getSize(),
                variant.getThickness(),
                variant.getColor(),
                price.getOriginalPrice(),
                price.getPrice(),
                price.getDiscountPercentage()
        );
    }

    private VariantPrice calculatePrice(
            ProductVariant variant,
            FlashSaleItem discount
    ) {
        BigDecimal originalPrice = variant.getPrice();

        if (discount == null) {
            return new VariantPrice(originalPrice, originalPrice, null);
        }

        BigDecimal price;
        if (discount.getDiscountType() == DiscountType.PERCENTAGE) {
            BigDecimal percentage = BigDecimal.valueOf(100)
                    .subtract(discount.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            price = originalPrice.multiply(percentage);
        } else {
            price = originalPrice.subtract(discount.getDiscountValue());
        }

        price = price.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        int discountPercentage = originalPrice.signum() == 0
                ? 0
                : BigDecimal.valueOf(100)
                        .subtract(price
                                .multiply(BigDecimal.valueOf(100))
                                .divide(originalPrice, 0, RoundingMode.HALF_UP))
                        .intValue();

        return new VariantPrice(originalPrice, price, discountPercentage);
    }

    private Map<Long, FlashSaleItem> getActiveDiscounts(LocalDateTime now) {
        return getActiveDiscounts(flashSaleRepository.findActiveAt(now));
    }

    private Map<Long, FlashSaleItem> getActiveDiscounts(List<FlashSale> flashSales) {
        Map<Long, FlashSaleItem> discounts = new HashMap<>();

        flashSales.stream()
                .flatMap(flashSale -> flashSale.getItems().stream())
                .forEach(item -> discounts.merge(
                        item.getProductVariant().getId(),
                        item,
                        this::selectBetterDiscount
                ));

        return discounts;
    }

    private FlashSaleItem selectBetterDiscount(
            FlashSaleItem first,
            FlashSaleItem second
    ) {
        BigDecimal originalPrice = first.getProductVariant().getPrice();
        BigDecimal firstPrice = calculatePrice(first.getProductVariant(), first).getPrice();
        BigDecimal secondPrice = calculatePrice(second.getProductVariant(), second).getPrice();

        if (originalPrice.signum() == 0) {
            return first;
        }

        return firstPrice.compareTo(secondPrice) <= 0 ? first : second;
    }

    private Sort createSort(String sort) {
        return switch (sort) {
            case "name,asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "name,desc" -> Sort.by(Sort.Direction.DESC, "name");
            case "price,asc", "price,desc" -> Sort.unsorted();
            default -> Sort.by(Sort.Direction.DESC, "id");
        };
    }

    private String normalizeSort(String sort) {
        String normalized = hasText(sort)
                ? sort.trim().toLowerCase(Locale.ROOT)
                : DEFAULT_SORT;

        if (!ALLOWED_SORTS.contains(normalized)) {
            throw new CatalogException("Invalid sort option", HttpStatus.BAD_REQUEST);
        }

        return normalized;
    }

    private void validateCriteria(ProductSearchCriteria criteria) {
        if (criteria.getMinPrice() != null
                && criteria.getMaxPrice() != null
                && criteria.getMinPrice().compareTo(criteria.getMaxPrice()) > 0) {
            throw new CatalogException(
                    "Minimum price cannot be greater than maximum price",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    private boolean hasVariantFilters(ProductSearchCriteria criteria) {
        return criteria.getMinPrice() != null
                || criteria.getMaxPrice() != null
                || !criteria.getSizes().isEmpty()
                || !criteria.getColors().isEmpty();
    }

    private List<String> normalizeValues(List<String> values) {
        return values
                .stream()
                .filter(this::hasText)
                .map(value -> value.trim().toLowerCase(Locale.ROOT))
                .toList();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static class VariantPrice {

        private final BigDecimal originalPrice;
        private final BigDecimal price;
        private final Integer discountPercentage;

        private VariantPrice(
                BigDecimal originalPrice,
                BigDecimal price,
                Integer discountPercentage
        ) {
            this.originalPrice = originalPrice;
            this.price = price;
            this.discountPercentage = discountPercentage;
        }

        private BigDecimal getOriginalPrice() {
            return originalPrice;
        }

        private BigDecimal getPrice() {
            return price;
        }

        private Integer getDiscountPercentage() {
            return discountPercentage;
        }
    }
}
