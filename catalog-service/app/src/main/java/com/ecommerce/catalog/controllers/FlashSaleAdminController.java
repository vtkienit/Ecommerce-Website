package com.ecommerce.catalog.controllers;

import com.ecommerce.catalog.dtos.AdminFlashSaleResponse;
import com.ecommerce.catalog.dtos.FlashSaleUpsertRequest;
import com.ecommerce.catalog.dtos.PageResponse;
import com.ecommerce.catalog.services.FlashSaleAdminService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/catalog/flash-sales")
@Validated
public class FlashSaleAdminController {

    private final FlashSaleAdminService flashSaleAdminService;

    public FlashSaleAdminController(FlashSaleAdminService flashSaleAdminService) {
        this.flashSaleAdminService = flashSaleAdminService;
    }

    @GetMapping
    public PageResponse<AdminFlashSaleResponse> getFlashSales(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "6") @Min(1) @Max(20) int size
    ) {
        return flashSaleAdminService.getFlashSales(page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminFlashSaleResponse createFlashSale(
            @Valid @RequestBody FlashSaleUpsertRequest request
    ) {
        return flashSaleAdminService.createFlashSale(request);
    }

    @PatchMapping("/{id}")
    public AdminFlashSaleResponse updateFlashSale(
            @PathVariable Long id,
            @Valid @RequestBody FlashSaleUpsertRequest request
    ) {
        return flashSaleAdminService.updateFlashSale(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFlashSale(@PathVariable Long id) {
        flashSaleAdminService.deleteFlashSale(id);
    }
}
