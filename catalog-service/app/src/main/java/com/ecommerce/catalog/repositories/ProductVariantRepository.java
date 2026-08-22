package com.ecommerce.catalog.repositories;

import com.ecommerce.catalog.entities.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
}
