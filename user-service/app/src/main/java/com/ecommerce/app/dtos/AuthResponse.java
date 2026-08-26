package com.ecommerce.app.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String tokenType;
    private long expiresIn;
    private String refreshToken;
    private long refreshExpiresIn;
    private boolean newUser;
    private UserResponse user;
}
