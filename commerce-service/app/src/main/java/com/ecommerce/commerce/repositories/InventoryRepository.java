package com.ecommerce.commerce.repositories;

import com.ecommerce.commerce.entities.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByVariantId(Long variantId);

    List<Inventory> findAllByVariantIdIn(List<Long> variantIds);

    List<Inventory> findAllByOrderByVariantIdAsc();

    @Query("""
            select count(inventory)
            from Inventory inventory
            where inventory.onHandQuantity - inventory.reservedQuantity <= :threshold
            """)
    long countLowStock(@Param("threshold") int threshold);

    @Query("""
            select inventory
            from Inventory inventory
            where inventory.onHandQuantity - inventory.reservedQuantity <= :threshold
            order by inventory.onHandQuantity - inventory.reservedQuantity, inventory.variantId
            """)
    List<Inventory> findLowStock(@Param("threshold") int threshold, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select inventory from Inventory inventory where inventory.variantId = :variantId")
    Optional<Inventory> findByVariantIdForUpdate(@Param("variantId") Long variantId);
}
