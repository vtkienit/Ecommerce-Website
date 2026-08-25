package com.ecommerce.catalog.services;

import com.ecommerce.catalog.dtos.AdminFlashSaleResponse;
import com.ecommerce.catalog.dtos.FlashSaleUpsertRequest;
import com.ecommerce.catalog.dtos.PageResponse;
import com.ecommerce.catalog.entities.DiscountType;
import com.ecommerce.catalog.entities.FlashSale;
import com.ecommerce.catalog.entities.FlashSaleItem;
import com.ecommerce.catalog.entities.Product;
import com.ecommerce.catalog.entities.ProductVariant;
import com.ecommerce.catalog.exceptions.CatalogException;
import com.ecommerce.catalog.repositories.FlashSaleRepository;
import com.ecommerce.catalog.repositories.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class FlashSaleAdminService {

    private static final BigDecimal MIN_PRODUCT_PRICE = new BigDecimal("50000");

    private final FlashSaleRepository flashSaleRepository;
    private final ProductRepository productRepository;

    public FlashSaleAdminService(
            FlashSaleRepository flashSaleRepository,
            ProductRepository productRepository
    ) {
        this.flashSaleRepository = flashSaleRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminFlashSaleResponse> getFlashSales(int page, int size) {
        Page<FlashSale> flashSales = flashSaleRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate"))
        );
        return new PageResponse<>(
                flashSales.getContent().stream().map(this::toResponse).toList(),
                flashSales.getNumber(),
                flashSales.getSize(),
                flashSales.getTotalElements(),
                flashSales.getTotalPages(),
                flashSales.isFirst(),
                flashSales.isLast()
        );
    }

    public AdminFlashSaleResponse createFlashSale(FlashSaleUpsertRequest request) {
        FlashSale flashSale = new FlashSale();
        updateFlashSale(flashSale, request);
        return toResponse(flashSaleRepository.save(flashSale));
    }

    public AdminFlashSaleResponse updateFlashSale(Long id, FlashSaleUpsertRequest request) {
        FlashSale flashSale = findFlashSale(id);
        updateFlashSale(flashSale, request);
        return toResponse(flashSale);
    }

    public void deleteFlashSale(Long id) {
        flashSaleRepository.delete(findFlashSale(id));
    }

    private void updateFlashSale(FlashSale flashSale, FlashSaleUpsertRequest request) {
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new CatalogException("End date must be after start date", HttpStatus.BAD_REQUEST);
        }
        if (flashSaleRepository.existsOverlapping(
                request.getStartDate(),
                request.getEndDate(),
                flashSale.getId()
        )) {
            throw new CatalogException(
                    "Flash sale period overlaps another campaign",
                    HttpStatus.CONFLICT
            );
        }

        List<Long> productIds = request.getProductIds().stream().distinct().toList();
        List<Product> products = productRepository.findAllById(productIds);
        if (products.size() != productIds.size()) {
            throw new CatalogException("One or more products were not found", HttpStatus.NOT_FOUND);
        }
        if (products.stream().anyMatch(product -> product.getVariants().isEmpty())) {
            throw new CatalogException("Every selected product must have at least one variant", HttpStatus.BAD_REQUEST);
        }

        validateDiscountedPrices(products, request.getDiscountPercentage());
        flashSale.setName(request.getName().trim());
        flashSale.setDescription(trimToNull(request.getDescription()));
        flashSale.setStartDate(request.getStartDate());
        flashSale.setEndDate(request.getEndDate());
        flashSale.getItems().clear();

        products.stream()
                .flatMap(product -> product.getVariants().stream())
                .forEach(variant -> flashSale.getItems().add(createItem(
                        flashSale,
                        variant,
                        request.getDiscountPercentage()
                )));
    }

    private void validateDiscountedPrices(List<Product> products, BigDecimal discountPercentage) {
        BigDecimal multiplier = BigDecimal.valueOf(100)
                .subtract(discountPercentage)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        boolean invalidPrice = products.stream()
                .flatMap(product -> product.getVariants().stream())
                .map(ProductVariant::getPrice)
                .map(price -> price.multiply(multiplier))
                .anyMatch(price -> price.compareTo(MIN_PRODUCT_PRICE) < 0);
        if (invalidPrice) {
            throw new CatalogException(
                    "Discounted product prices must be at least 50000",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    private FlashSaleItem createItem(
            FlashSale flashSale,
            ProductVariant variant,
            BigDecimal discountPercentage
    ) {
        FlashSaleItem item = new FlashSaleItem();
        item.setFlashSale(flashSale);
        item.setProductVariant(variant);
        item.setDiscountType(DiscountType.PERCENTAGE);
        item.setDiscountValue(discountPercentage);
        return item;
    }

    private FlashSale findFlashSale(Long id) {
        return flashSaleRepository.findById(id)
                .orElseThrow(() -> new CatalogException("Flash sale not found", HttpStatus.NOT_FOUND));
    }

    private AdminFlashSaleResponse toResponse(FlashSale flashSale) {
        Set<Long> productIds = new LinkedHashSet<>();
        flashSale.getItems().forEach(item ->
                productIds.add(item.getProductVariant().getProduct().getId())
        );
        BigDecimal discountPercentage = flashSale.getItems().isEmpty()
                ? BigDecimal.ZERO
                : flashSale.getItems().getFirst().getDiscountValue();
        return new AdminFlashSaleResponse(
                flashSale.getId(),
                flashSale.getName(),
                flashSale.getDescription(),
                flashSale.getStartDate(),
                flashSale.getEndDate(),
                discountPercentage,
                List.copyOf(productIds),
                productIds.size(),
                flashSale.getItems().size()
        );
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
