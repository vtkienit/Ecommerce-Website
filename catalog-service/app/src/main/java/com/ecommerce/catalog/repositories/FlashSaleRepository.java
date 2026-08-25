package com.ecommerce.catalog.repositories;

import com.ecommerce.catalog.entities.FlashSale;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {

    @EntityGraph(attributePaths = {
            "items",
            "items.productVariant",
            "items.productVariant.product"
    })
    @Query("""
            SELECT DISTINCT flashSale
            FROM FlashSale flashSale
            WHERE flashSale.startDate <= :now
              AND flashSale.endDate > :now
            ORDER BY flashSale.endDate ASC
            """)
    List<FlashSale> findActiveAt(@Param("now") LocalDateTime now);

    @Query("""
            SELECT CASE WHEN COUNT(flashSale) > 0 THEN true ELSE false END
            FROM FlashSale flashSale
            WHERE flashSale.startDate < :endDate
              AND flashSale.endDate > :startDate
              AND (:excludeId IS NULL OR flashSale.id <> :excludeId)
            """)
    boolean existsOverlapping(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("excludeId") Long excludeId
    );
}
