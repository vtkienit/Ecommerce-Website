package com.ecommerce.app.controllers;

import com.ecommerce.app.dtos.AuthResponse;
import com.ecommerce.app.dtos.ForgotPasswordRequest;
import com.ecommerce.app.dtos.GoogleAuthRequest;
import com.ecommerce.app.dtos.PasswordResetChallengeResponse;
import com.ecommerce.app.dtos.RefreshTokenRequest;
import com.ecommerce.app.dtos.ResetPasswordRequest;
import com.ecommerce.app.dtos.ResetTokenResponse;
import com.ecommerce.app.dtos.UserLoginRequest;
import com.ecommerce.app.dtos.UserRegisterRequest;
import com.ecommerce.app.dtos.VerifyResetCodeRequest;
import com.ecommerce.app.services.PasswordResetService;
import com.ecommerce.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;

    public AuthController(UserService userService, PasswordResetService passwordResetService) {
        this.userService = userService;
        this.passwordResetService = passwordResetService;
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

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return userService.refresh(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@Valid @RequestBody RefreshTokenRequest request) {
        userService.logout(request);
    }

    @PostMapping("/forgot-password")
    public PasswordResetChallengeResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return passwordResetService.requestCode(request);
    }

    @PostMapping("/verify-reset-code")
    public ResetTokenResponse verifyResetCode(@Valid @RequestBody VerifyResetCodeRequest request) {
        return passwordResetService.verifyCode(request);
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
    }
}
