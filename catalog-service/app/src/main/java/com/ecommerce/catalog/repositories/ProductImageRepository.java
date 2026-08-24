package com.ecommerce.catalog.repositories;

import com.ecommerce.catalog.entities.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
