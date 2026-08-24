package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.InventoryResponse;
import com.ecommerce.commerce.dtos.UpdateInventoryRequest;
import com.ecommerce.commerce.services.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<InventoryResponse> getInventory() {
        return inventoryService.getInventory();
    }

    @PostMapping("/sync")
    public List<InventoryResponse> syncCatalog() {
        return inventoryService.syncCatalog();
    }

    @PatchMapping("/{variantId}")
    public InventoryResponse updateStock(
            @PathVariable Long variantId,
            @Valid @RequestBody UpdateInventoryRequest request
    ) {
        return inventoryService.updateStock(variantId, request.getOnHandQuantity());
    }
}
