package com.ecommerce.catalog.repositories;

import com.ecommerce.catalog.entities.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
}
