package com.ecommerce.commerce.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inventories")
@Getter
@Setter
@NoArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long variantId;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private Integer onHandQuantity;

    @Column(nullable = false)
    private Integer reservedQuantity;

    @Version
    private Long version;
}
