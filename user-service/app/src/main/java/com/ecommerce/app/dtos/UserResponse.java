package com.ecommerce.app.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String addressLine;
    private Integer provinceCode;
    private String provinceName;
    private Integer wardCode;
    private String wardName;
    private String gender;
    private LocalDate dateOfBirth;
    private String role;
}
