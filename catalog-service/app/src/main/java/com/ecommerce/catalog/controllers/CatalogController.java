package com.ecommerce.catalog.controllers;

import com.ecommerce.catalog.dtos.*;
import com.ecommerce.catalog.services.CatalogService;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/categories")
    public List<CategoryResponse> getCategories() {
        return catalogService.getCategories();
    }

    @GetMapping("/products")
    public PageResponse<ProductSummaryResponse> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false)
            @DecimalMin(value = "0", message = "Minimum price must be positive")
            BigDecimal minPrice,
            @RequestParam(required = false)
            @DecimalMin(value = "0", message = "Maximum price must be positive")
            BigDecimal maxPrice,
            @RequestParam(defaultValue = "") List<String> variantSize,
            @RequestParam(defaultValue = "") List<String> color,
            @RequestParam(defaultValue = "newest,desc") String sort,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "Page must be at least 0")
            int page,
            @RequestParam(name = "size", defaultValue = "12")
            @Min(value = 1, message = "Page size must be at least 1")
            @Max(value = 100, message = "Page size must not exceed 100")
            int pageSize
    ) {
        ProductSearchCriteria criteria = new ProductSearchCriteria(
                category,
                search,
                minPrice,
                maxPrice,
                removeBlankValues(variantSize),
                removeBlankValues(color),
                sort,
                page,
                pageSize
        );

        return catalogService.getProducts(criteria);
    }

    @GetMapping("/products/{slug}")
    public ProductDetailResponse getProduct(@PathVariable String slug) {
        return catalogService.getProduct(slug);
    }

    @GetMapping("/variants/{id}")
    public CatalogVariantResponse getVariant(@PathVariable Long id) {
        return catalogService.getVariant(id);
    }

    @GetMapping("/variants")
    public List<CatalogVariantResponse> getVariants() {
        return catalogService.getVariants();
    }

    @GetMapping("/flash-sales/current")
    public ResponseEntity<FlashSaleResponse> getCurrentFlashSale() {
        return catalogService
                .getCurrentFlashSale()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    private List<String> removeBlankValues(List<String> values) {
        return values
                .stream()
                .filter(value -> value != null && !value.isBlank())
                .toList();
    }
}
