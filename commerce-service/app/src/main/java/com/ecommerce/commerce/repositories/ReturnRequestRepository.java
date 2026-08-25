package com.ecommerce.commerce.repositories;

import com.ecommerce.commerce.entities.ReturnRequest;
import com.ecommerce.commerce.entities.ReturnRequestStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    boolean existsByOrderId(Long orderId);

    List<ReturnRequest> findAllByOrderByRequestedAtDesc();

    List<ReturnRequest> findByStatusOrderByRequestedAtDesc(ReturnRequestStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select returnRequest from ReturnRequest returnRequest where returnRequest.id = :id")
    Optional<ReturnRequest> findByIdForUpdate(@Param("id") Long id);
}
