package com.ecommerce.commerce;

import com.ecommerce.commerce.configs.InventoryDataInitializer;
import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.services.InventoryService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class InventoryDataInitializerTests {

    @Test
    void synchronizesInventoryOnStartup() {
        InventoryService inventoryService = mock(InventoryService.class);
        when(inventoryService.syncCatalog()).thenReturn(List.of());

        new InventoryDataInitializer(inventoryService).run(null);

        verify(inventoryService).syncCatalog();
    }

    @Test
    void keepsCommerceRunningWhenCatalogIsUnavailable() {
        InventoryService inventoryService = mock(InventoryService.class);
        doThrow(new CommerceException("Catalog Service is unavailable", HttpStatus.SERVICE_UNAVAILABLE))
                .when(inventoryService)
                .syncCatalog();

        assertThatCode(() -> new InventoryDataInitializer(inventoryService).run(null))
                .doesNotThrowAnyException();
    }
}
