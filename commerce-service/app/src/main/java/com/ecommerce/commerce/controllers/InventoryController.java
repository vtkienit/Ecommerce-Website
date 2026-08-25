package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.InventoryResponse;
import com.ecommerce.commerce.dtos.PageResponse;
import com.ecommerce.commerce.dtos.UpdateInventoryRequest;
import com.ecommerce.commerce.services.InventoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/admin/inventory")
@Validated
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public PageResponse<InventoryResponse> getInventory(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size,
            @RequestParam(defaultValue = "") String search
    ) {
        return inventoryService.getInventory(page, size, search);
    }

    @PostMapping("/sync")
    public PageResponse<InventoryResponse> syncCatalog(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size,
            @RequestParam(defaultValue = "") String search
    ) {
        return inventoryService.syncCatalog(page, size, search);
    }

    @PatchMapping("/{variantId}")
    public InventoryResponse updateStock(
            @PathVariable Long variantId,
            @Valid @RequestBody UpdateInventoryRequest request
    ) {
        return inventoryService.updateStock(variantId, request.getOnHandQuantity());
    }
}
