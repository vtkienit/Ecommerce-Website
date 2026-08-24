package com.ecommerce.app.exceptions;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BaseException extends RuntimeException {

    private final HttpStatus status;
    private final Integer remainingAttempts;

    public BaseException(String message, HttpStatus status) {
        this(message, status, null);
    }

    public BaseException(String message, HttpStatus status, Integer remainingAttempts) {
        super(message);
        this.status = status;
        this.remainingAttempts = remainingAttempts;
    }
}
