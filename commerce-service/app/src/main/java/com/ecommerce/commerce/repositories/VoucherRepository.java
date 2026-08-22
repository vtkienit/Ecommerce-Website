package com.ecommerce.commerce.repositories;

import com.ecommerce.commerce.entities.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
}
