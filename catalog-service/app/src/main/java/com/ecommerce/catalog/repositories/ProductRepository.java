package com.ecommerce.catalog.repositories;

import com.ecommerce.catalog.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

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
}
