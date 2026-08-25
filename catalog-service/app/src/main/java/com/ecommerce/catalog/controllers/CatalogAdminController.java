package com.ecommerce.catalog.controllers;

import com.ecommerce.catalog.dtos.AdminProductResponse;
import com.ecommerce.catalog.dtos.CategoryResponse;
import com.ecommerce.catalog.dtos.CategoryUpsertRequest;
import com.ecommerce.catalog.dtos.ImageUpsertRequest;
import com.ecommerce.catalog.dtos.PageResponse;
import com.ecommerce.catalog.dtos.ProductUpsertRequest;
import com.ecommerce.catalog.dtos.VariantUpsertRequest;
import com.ecommerce.catalog.services.CatalogAdminService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@RestController
@RequestMapping("/api/admin/catalog")
@Validated
public class CatalogAdminController {

    private final CatalogAdminService catalogAdminService;

    public CatalogAdminController(CatalogAdminService catalogAdminService) {
        this.catalogAdminService = catalogAdminService;
    }

    @GetMapping("/categories")
    public List<CategoryResponse> getCategories() {
        return catalogAdminService.getCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(@Valid @RequestBody CategoryUpsertRequest request) {
        return catalogAdminService.createCategory(request);
    }

    @PatchMapping("/categories/{id}")
    public CategoryResponse updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpsertRequest request
    ) {
        return catalogAdminService.updateCategory(id, request);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        catalogAdminService.deleteCategory(id);
    }

    @GetMapping("/products")
    public PageResponse<AdminProductResponse> getProducts(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "6") @Min(1) @Max(50) int size,
            @RequestParam(defaultValue = "") String search
    ) {
        return catalogAdminService.getProducts(page, size, search);
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductResponse createProduct(@Valid @RequestBody ProductUpsertRequest request) {
        return catalogAdminService.createProduct(request);
    }

    @PatchMapping("/products/{id}")
    public AdminProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpsertRequest request
    ) {
        return catalogAdminService.updateProduct(id, request);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        catalogAdminService.deleteProduct(id);
    }

    @PostMapping("/products/{productId}/variants")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductResponse createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody VariantUpsertRequest request
    ) {
        return catalogAdminService.createVariant(productId, request);
    }

    @PatchMapping("/variants/{id}")
    public AdminProductResponse updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody VariantUpsertRequest request
    ) {
        return catalogAdminService.updateVariant(id, request);
    }

    @DeleteMapping("/variants/{id}")
    public AdminProductResponse deleteVariant(@PathVariable Long id) {
        return catalogAdminService.deleteVariant(id);
    }

    @PostMapping("/products/{productId}/images")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductResponse createImage(
            @PathVariable Long productId,
            @Valid @RequestBody ImageUpsertRequest request
    ) {
        return catalogAdminService.createImage(productId, request);
    }

    @PostMapping(
            value = "/products/{productId}/images/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(HttpStatus.CREATED)
    public AdminProductResponse uploadImages(
            @PathVariable Long productId,
            @RequestPart(value = "primaryImage", required = false) MultipartFile primaryImage,
            @RequestPart(value = "secondaryImages", required = false) List<MultipartFile> secondaryImages
    ) {
        return catalogAdminService.uploadImages(productId, primaryImage, secondaryImages);
    }

    @PatchMapping("/images/{id}")
    public AdminProductResponse updateImage(
            @PathVariable Long id,
            @Valid @RequestBody ImageUpsertRequest request
    ) {
        return catalogAdminService.updateImage(id, request);
    }

    @DeleteMapping("/images/{id}")
    public AdminProductResponse deleteImage(@PathVariable Long id) {
        return catalogAdminService.deleteImage(id);
    }
}
