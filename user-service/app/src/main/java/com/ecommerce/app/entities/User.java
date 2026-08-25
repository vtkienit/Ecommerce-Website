package com.ecommerce.app.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Column(name = "google_subject", unique = true)
    private String googleSubject;

    private String phone;

    @Column(length = 500)
    private String address;

    @Column(name = "address_line", length = 255)
    private String addressLine;

    @Column(name = "province_code")
    private Integer provinceCode;

    @Column(name = "province_name", length = 100)
    private String provinceName;

    @Column(name = "ward_code")
    private Integer wardCode;

    @Column(name = "ward_name", length = 100)
    private String wardName;

    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private String role = "Customer";
}
