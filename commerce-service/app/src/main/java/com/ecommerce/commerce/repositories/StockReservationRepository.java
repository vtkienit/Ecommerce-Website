package com.ecommerce.commerce.repositories;

import com.ecommerce.commerce.entities.StockReservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockReservationRepository extends JpaRepository<StockReservation, Long> {
}
