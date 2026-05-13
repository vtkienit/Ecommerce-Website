package com.ecommerce.app.exceptions;

import com.ecommerce.app.dtos.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex) {

        ErrorResponse response = new ErrorResponse(ex.getStatus().value(), ex.getMessage());

        return ResponseEntity
                .status(ex.getStatus())
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {

        log.error("Unexpected error", ex);

        ErrorResponse response = new ErrorResponse(500, "Internal server error");

        return ResponseEntity
                .internalServerError()
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {

        String message = ex
                .getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        ErrorResponse response = new ErrorResponse(400, message);

        return ResponseEntity
                .badRequest()
                .body(response);
    }
}