package com.ecommerce.app.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class UserProfileUpdateRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must contain between 2 and 100 characters")
    private String name;

    @Pattern(
            regexp = "^$|^[0-9+() .-]{8,20}$",
            message = "Invalid phone number"
    )
    private String phone;

    @Pattern(
            regexp = "^$|MALE|FEMALE|OTHER",
            message = "Invalid gender"
    )
    private String gender;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
}
