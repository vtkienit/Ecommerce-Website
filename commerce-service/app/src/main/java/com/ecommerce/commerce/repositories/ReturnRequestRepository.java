package com.ecommerce.commerce.repositories;

import com.ecommerce.commerce.entities.ReturnRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long>, JpaSpecificationExecutor<ReturnRequest> {

    boolean existsByOrderId(Long orderId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select returnRequest from ReturnRequest returnRequest where returnRequest.id = :id")
    Optional<ReturnRequest> findByIdForUpdate(@Param("id") Long id);
}
