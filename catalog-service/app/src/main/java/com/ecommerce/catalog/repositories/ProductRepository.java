package com.ecommerce.catalog.repositories;

import com.ecommerce.catalog.entities.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);

    long countByProductCategoryId(Long categoryId);

    List<Product> findTop5ByProductCategoryIdAndIdNotOrderByIdDesc(
            Long categoryId,
            Long productId
    );

    @Query("""
            SELECT product
            FROM Product product
            JOIN FETCH product.productCategory category
            WHERE LOWER(product.name) LIKE :contains
               OR LOWER(COALESCE(product.brand, '')) LIKE :contains
               OR LOWER(category.name) LIKE :contains
            ORDER BY CASE
                WHEN LOWER(product.name) = :keyword THEN 0
                WHEN LOWER(product.name) LIKE :prefix THEN 1
                WHEN LOWER(COALESCE(product.brand, '')) = :keyword THEN 2
                WHEN LOWER(COALESCE(product.brand, '')) LIKE :prefix THEN 3
                WHEN LOWER(category.name) = :keyword THEN 4
                WHEN LOWER(category.name) LIKE :prefix THEN 5
                ELSE 6
            END,
            product.name ASC
            """)
    List<Product> findSearchSuggestions(
            @Param("keyword") String keyword,
            @Param("prefix") String prefix,
            @Param("contains") String contains,
            Pageable pageable
    );
}
