package com.ecommerce.commerce.services;

import com.ecommerce.commerce.clients.CatalogGateway;
import com.ecommerce.commerce.dtos.CatalogVariantSnapshot;
import com.ecommerce.commerce.dtos.InventoryResponse;
import com.ecommerce.commerce.dtos.PageResponse;
import com.ecommerce.commerce.dtos.VariantAvailabilityResponse;
import com.ecommerce.commerce.entities.Inventory;
import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.repositories.InventoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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
    public PageResponse<InventoryResponse> getInventory(int page, int size, String search) {
        List<CatalogVariantSnapshot> variants = catalogGateway.getVariants();
        Map<Long, Inventory> inventoryByVariant = inventoryRepository
                .findAllByOrderByVariantIdAsc()
                .stream()
                .collect(Collectors.toMap(Inventory::getVariantId, Function.identity()));

        return paginate(variants, inventoryByVariant, page, size, search);
    }

    public PageResponse<InventoryResponse> syncCatalog(int page, int size, String search) {
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

        return paginate(variants, inventoryByVariant, page, size, search);
    }

    public List<InventoryResponse> syncCatalog() {
        return syncCatalog(0, Integer.MAX_VALUE, "").getContent();
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

    @Transactional(readOnly = true)
    public List<VariantAvailabilityResponse> getAvailability(List<Long> variantIds) {
        Map<Long, Inventory> inventoryByVariant = inventoryRepository
                .findAllByVariantIdIn(variantIds)
                .stream()
                .collect(Collectors.toMap(Inventory::getVariantId, Function.identity()));

        return variantIds.stream()
                .distinct()
                .map(variantId -> {
                    Inventory inventory = inventoryByVariant.get(variantId);
                    int available = inventory == null
                            ? 0
                            : inventory.getOnHandQuantity() - inventory.getReservedQuantity();
                    return new VariantAvailabilityResponse(variantId, Math.max(0, available));
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public int getAvailableQuantity(Long variantId) {
        return inventoryRepository
                .findByVariantId(variantId)
                .map(inventory -> Math.max(
                        0,
                        inventory.getOnHandQuantity() - inventory.getReservedQuantity()
                ))
                .orElse(defaultStock);
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

    private boolean matchesSearch(InventoryResponse item, String search) {
        if (search == null || search.isBlank()) return true;
        String keyword = search.trim().toLowerCase(Locale.ROOT);
        return Stream.of(
                        item.getProductName(),
                        item.getSku(),
                        item.getSize(),
                        item.getColor()
                )
                .filter(value -> value != null && !value.isBlank())
                .anyMatch(value -> value.toLowerCase(Locale.ROOT).contains(keyword));
    }

    private PageResponse<InventoryResponse> paginate(
            List<CatalogVariantSnapshot> variants,
            Map<Long, Inventory> inventoryByVariant,
            int page,
            int size,
            String search
    ) {
        List<InventoryResponse> inventory = variants
                .stream()
                .map(variant -> toResponse(variant, inventoryByVariant.get(variant.getId())))
                .filter(item -> matchesSearch(item, search))
                .toList();
        int from = Math.min(page * size, inventory.size());
        int to = Math.min(from + size, inventory.size());
        int totalPages = inventory.isEmpty() ? 0 : (int) Math.ceil((double) inventory.size() / size);
        return new PageResponse<>(
                inventory.subList(from, to),
                page,
                size,
                inventory.size(),
                totalPages,
                page == 0,
                page + 1 >= totalPages
        );
    }
}
