package com.ecommerce.app.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserUpdateRequest {
    @Size(min = 2, message = "Name must be at least 2 characters")
    private String name;

    @Email(message = "Invalid email")
    private String email;

    @Size(min = 4, message = "Password must be at least 4 characters")
    private String password;

    private String phone;

    private String address;
}
