package com.ecommerce.app.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    private String discountType;

    private Double discountValue;
    private Double minOrderAmount;
    private Double maxDiscountAmount;

    private Integer quantity;
    private Integer usedCount;

    private LocalDateTime startDate;
    private LocalDateTime endDate;
}