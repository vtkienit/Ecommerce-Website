package com.ecommerce.commerce.repositories;

import com.ecommerce.commerce.entities.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {
}
