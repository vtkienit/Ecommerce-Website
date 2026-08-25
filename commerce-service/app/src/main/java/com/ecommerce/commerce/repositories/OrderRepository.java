package com.ecommerce.commerce.repositories;

import com.ecommerce.commerce.entities.Order;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    boolean existsByVoucherId(Long voucherId);

    @EntityGraph(attributePaths = "items")
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = "items")
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select customerOrder from Order customerOrder where customerOrder.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select customerOrder
            from Order customerOrder
            where customerOrder.id = :id and customerOrder.userId = :userId
            """)
    Optional<Order> findByIdAndUserIdForUpdate(@Param("id") Long id, @Param("userId") Long userId);
}
