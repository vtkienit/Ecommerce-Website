package com.ecommerce.app.dtos;

import lombok.Getter;

@Getter
public class ErrorResponse {

    private final String message;
    private final Integer remainingAttempts;

    public ErrorResponse(String message) {
        this(message, null);
    }

    public ErrorResponse(String message, Integer remainingAttempts) {
        this.message = message;
        this.remainingAttempts = remainingAttempts;
    }
}
