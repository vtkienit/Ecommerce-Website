package com.ecommerce.catalog.repositories;

import com.ecommerce.catalog.dtos.CategoryResponse;
import com.ecommerce.catalog.entities.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {

    @Query("""
            SELECT new com.ecommerce.catalog.dtos.CategoryResponse(
                category.id,
                category.slug,
                category.name,
                COUNT(product.id)
            )
            FROM ProductCategory category
            LEFT JOIN category.products product
            GROUP BY category.id, category.slug, category.name
            ORDER BY category.name
            """)
    List<CategoryResponse> findAllSummaries();

    Optional<ProductCategory> findBySlugIgnoreCase(String slug);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    boolean existsBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);
}
