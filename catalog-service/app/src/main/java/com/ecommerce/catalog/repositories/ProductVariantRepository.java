package com.ecommerce.catalog.repositories;

import com.ecommerce.catalog.entities.ProductVariant;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    @EntityGraph(attributePaths = {"product", "product.images"})
    Optional<ProductVariant> findWithProductById(Long id);

    @EntityGraph(attributePaths = {"product", "product.images"})
    @Query("select variant from ProductVariant variant order by variant.id")
    List<ProductVariant> findAllWithProduct();
}
