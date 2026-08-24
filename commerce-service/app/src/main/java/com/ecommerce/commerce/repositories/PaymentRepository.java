package com.ecommerce.commerce.repositories;

import com.ecommerce.commerce.entities.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
