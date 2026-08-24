package com.ecommerce.catalog.repositories;

import com.ecommerce.catalog.entities.FlashSaleItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlashSaleItemRepository extends JpaRepository<FlashSaleItem, Long> {

    boolean existsByProductVariantId(Long variantId);

    boolean existsByProductVariantProductId(Long productId);
}
