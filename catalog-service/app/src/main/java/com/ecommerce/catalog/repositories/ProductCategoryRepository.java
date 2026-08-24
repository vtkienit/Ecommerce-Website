package com.ecommerce.catalog.repositories;

import com.ecommerce.catalog.entities.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {

    List<ProductCategory> findAllByOrderByNameAsc();

    Optional<ProductCategory> findBySlugIgnoreCase(String slug);
}
