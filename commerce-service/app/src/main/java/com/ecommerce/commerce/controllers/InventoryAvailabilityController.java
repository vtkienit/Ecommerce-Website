package com.ecommerce.commerce.controllers;

import com.ecommerce.commerce.dtos.VariantAvailabilityResponse;
import com.ecommerce.commerce.services.InventoryService;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@Validated
public class InventoryAvailabilityController {

    private final InventoryService inventoryService;

    public InventoryAvailabilityController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/availability")
    public List<VariantAvailabilityResponse> getAvailability(
            @RequestParam
            @Size(min = 1, max = 50)
            List<@Positive Long> variantIds
    ) {
        return inventoryService.getAvailability(variantIds);
    }
}
