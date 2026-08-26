package com.ecommerce.commerce.repositories;

import com.ecommerce.commerce.entities.Order;
import com.ecommerce.commerce.entities.OrderStatus;
import com.ecommerce.commerce.dtos.OrderStatusCount;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    boolean existsByVoucherId(Long voucherId);

    boolean existsByTrackingCodeIgnoreCase(String trackingCode);

    long countByStatus(OrderStatus status);

    List<Order> findTop5ByOrderByCreatedAtDesc();

    @Query("select coalesce(sum(customerOrder.totalAmount), 0) from Order customerOrder where customerOrder.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") OrderStatus status);

    @Query("""
            select coalesce(sum(customerOrder.totalAmount), 0)
            from Order customerOrder
            where customerOrder.status = :status and customerOrder.createdAt >= :from
            """)
    BigDecimal sumTotalAmountByStatusSince(
            @Param("status") OrderStatus status,
            @Param("from") LocalDateTime from
    );

    @Query("""
            select new com.ecommerce.commerce.dtos.OrderStatusCount(customerOrder.status, count(customerOrder))
            from Order customerOrder
            group by customerOrder.status
            """)
    List<OrderStatusCount> countOrdersByStatus();

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
