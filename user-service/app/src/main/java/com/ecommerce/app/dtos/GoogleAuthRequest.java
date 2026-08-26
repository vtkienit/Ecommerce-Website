package com.ecommerce.app.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GoogleAuthRequest {

    @NotBlank(message = "Google credential is required")
    private String credential;

    private boolean rememberMe;
}
