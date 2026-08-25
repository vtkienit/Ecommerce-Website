package com.ecommerce.commerce.repositories;

import com.ecommerce.commerce.entities.Voucher;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, Long>, JpaSpecificationExecutor<Voucher> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select voucher from Voucher voucher where voucher.id = :id")
    Optional<Voucher> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select voucher from Voucher voucher where upper(voucher.code) = upper(:code)")
    Optional<Voucher> findByCodeForUpdate(@Param("code") String code);
}
