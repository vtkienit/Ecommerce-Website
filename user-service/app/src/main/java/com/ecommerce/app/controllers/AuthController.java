package com.ecommerce.app.controllers;

import com.ecommerce.app.dtos.AuthResponse;
import com.ecommerce.app.dtos.GoogleAuthRequest;
import com.ecommerce.app.dtos.UserLoginRequest;
import com.ecommerce.app.dtos.UserRegisterRequest;
import com.ecommerce.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody UserRegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody UserLoginRequest request) {
        return userService.login(request);
    }

    @PostMapping("/google")
    public AuthResponse authenticateWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
        return userService.authenticateWithGoogle(request);
    }
}
