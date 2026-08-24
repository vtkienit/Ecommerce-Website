package com.ecommerce.commerce.services;

import com.ecommerce.commerce.clients.CatalogGateway;
import com.ecommerce.commerce.dtos.CatalogVariantSnapshot;
import com.ecommerce.commerce.dtos.InventoryResponse;
import com.ecommerce.commerce.entities.Inventory;
import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.repositories.InventoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final CatalogGateway catalogGateway;
    private final int defaultStock;

    public InventoryService(
            InventoryRepository inventoryRepository,
            CatalogGateway catalogGateway,
            @Value("${commerce.inventory.default-stock:10}") int defaultStock
    ) {
        this.inventoryRepository = inventoryRepository;
        this.catalogGateway = catalogGateway;
        this.defaultStock = defaultStock;
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getInventory() {
        List<CatalogVariantSnapshot> variants = catalogGateway.getVariants();
        Map<Long, Inventory> inventoryByVariant = inventoryRepository
                .findAllByOrderByVariantIdAsc()
                .stream()
                .collect(Collectors.toMap(Inventory::getVariantId, Function.identity()));

        return variants
                .stream()
                .map(variant -> toResponse(variant, inventoryByVariant.get(variant.getId())))
                .toList();
    }

    public List<InventoryResponse> syncCatalog() {
        List<CatalogVariantSnapshot> variants = catalogGateway.getVariants();
        Map<Long, Inventory> inventoryByVariant = inventoryRepository
                .findAllByOrderByVariantIdAsc()
                .stream()
                .collect(Collectors.toMap(Inventory::getVariantId, Function.identity()));

        for (CatalogVariantSnapshot variant : variants) {
            Inventory inventory = inventoryByVariant.get(variant.getId());
            if (inventory == null) {
                inventory = new Inventory();
                inventory.setVariantId(variant.getId());
                inventory.setSku(variant.getSku());
                inventory.setOnHandQuantity(defaultStock);
                inventory.setReservedQuantity(0);
                inventoryByVariant.put(variant.getId(), inventoryRepository.save(inventory));
            } else if (!inventory.getSku().equals(variant.getSku())) {
                inventory.setSku(variant.getSku());
            }
        }

        return variants
                .stream()
                .map(variant -> toResponse(variant, inventoryByVariant.get(variant.getId())))
                .toList();
    }

    public InventoryResponse updateStock(Long variantId, Integer onHandQuantity) {
        CatalogVariantSnapshot variant = catalogGateway.getVariant(variantId);
        Inventory inventory = inventoryRepository
                .findByVariantIdForUpdate(variantId)
                .orElseGet(() -> createEmptyInventory(variant));

        if (onHandQuantity < inventory.getReservedQuantity()) {
            throw new CommerceException(
                    "Stock cannot be lower than the reserved quantity",
                    HttpStatus.CONFLICT
            );
        }

        inventory.setOnHandQuantity(onHandQuantity);
        inventory.setSku(variant.getSku());
        return toResponse(variant, inventoryRepository.save(inventory));
    }

    private Inventory createEmptyInventory(CatalogVariantSnapshot variant) {
        Inventory inventory = new Inventory();
        inventory.setVariantId(variant.getId());
        inventory.setSku(variant.getSku());
        inventory.setOnHandQuantity(0);
        inventory.setReservedQuantity(0);
        return inventory;
    }

    private InventoryResponse toResponse(
            CatalogVariantSnapshot variant,
            Inventory inventory
    ) {
        int onHand = inventory == null ? 0 : inventory.getOnHandQuantity();
        int reserved = inventory == null ? 0 : inventory.getReservedQuantity();
        return new InventoryResponse(
                inventory == null ? null : inventory.getId(),
                variant.getId(),
                variant.getProductSlug(),
                variant.getProductName(),
                variant.getImageUrl(),
                variant.getSku(),
                variant.getSize(),
                variant.getThickness(),
                variant.getColor(),
                onHand,
                reserved,
                Math.max(0, onHand - reserved)
        );
    }
}
