package com.ecommerce.commerce.repositories;

import com.ecommerce.commerce.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
