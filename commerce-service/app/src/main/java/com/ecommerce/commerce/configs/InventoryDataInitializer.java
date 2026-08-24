package com.ecommerce.commerce.configs;

import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.services.InventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "commerce.inventory.seed.enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class InventoryDataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(InventoryDataInitializer.class);

    private final InventoryService inventoryService;

    public InventoryDataInitializer(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        try {
            int variantCount = inventoryService.syncCatalog().size();
            log.info("Inventory synchronized with {} Catalog variants", variantCount);
        } catch (CommerceException exception) {
            log.warn("Inventory initialization skipped: {}", exception.getMessage());
        }
    }
}
