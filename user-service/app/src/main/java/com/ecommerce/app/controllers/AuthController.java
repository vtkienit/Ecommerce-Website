package com.ecommerce.app.controllers;

import com.ecommerce.app.dtos.AuthResponse;
import com.ecommerce.app.dtos.AuthSession;
import com.ecommerce.app.dtos.ForgotPasswordRequest;
import com.ecommerce.app.dtos.GoogleAuthRequest;
import com.ecommerce.app.dtos.PasswordResetChallengeResponse;
import com.ecommerce.app.dtos.ResetPasswordRequest;
import com.ecommerce.app.dtos.ResetTokenResponse;
import com.ecommerce.app.dtos.UserLoginRequest;
import com.ecommerce.app.dtos.UserRegisterRequest;
import com.ecommerce.app.dtos.VerifyResetCodeRequest;
import com.ecommerce.app.services.PasswordResetService;
import com.ecommerce.app.services.RefreshTokenCookieService;
import com.ecommerce.app.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;
    private final RefreshTokenCookieService refreshTokenCookieService;

    public AuthController(
            UserService userService,
            PasswordResetService passwordResetService,
            RefreshTokenCookieService refreshTokenCookieService
    ) {
        this.userService = userService;
        this.passwordResetService = passwordResetService;
        this.refreshTokenCookieService = refreshTokenCookieService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UserRegisterRequest request) {
        return authResponse(userService.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody UserLoginRequest request) {
        return authResponse(userService.login(request), HttpStatus.OK);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> authenticateWithGoogle(
            @Valid @RequestBody GoogleAuthRequest request
    ) {
        return authResponse(userService.authenticateWithGoogle(request), HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(
                    name = RefreshTokenCookieService.COOKIE_NAME,
                    required = false
            ) String refreshToken
    ) {
        return authResponse(userService.refresh(refreshToken), HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(
                    name = RefreshTokenCookieService.COOKIE_NAME,
                    required = false
            ) String refreshToken
    ) {
        userService.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookieService.clear().toString())
                .build();
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

    private ResponseEntity<AuthResponse> authResponse(AuthSession session, HttpStatus status) {
        return ResponseEntity.status(status)
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshTokenCookieService.create(
                                session.getRefreshToken(),
                                session.isPersistent()
                        ).toString()
                )
                .body(session.getResponse());
    }
}
