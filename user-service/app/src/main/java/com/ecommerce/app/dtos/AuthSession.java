package com.ecommerce.app.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthSession {

    private AuthResponse response;
    private String refreshToken;
    private boolean persistent;
}
