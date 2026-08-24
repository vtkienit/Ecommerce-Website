package com.ecommerce.commerce.clients;

import com.ecommerce.commerce.dtos.CatalogVariantSnapshot;

import java.util.List;

public interface CatalogGateway {

    CatalogVariantSnapshot getVariant(Long variantId);

    List<CatalogVariantSnapshot> getVariants();
}
