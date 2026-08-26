package com.ecommerce.app.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RefreshTokenCookieService {

    public static final String COOKIE_NAME = "quydung_refresh_token";

    private final boolean secure;
    private final String sameSite;
    private final Duration expiration;

    public RefreshTokenCookieService(
            @Value("${security.refresh-token.cookie-secure:false}") boolean secure,
            @Value("${security.refresh-token.cookie-same-site:Lax}") String sameSite,
            @Value("${security.refresh-token.expiration-seconds:2592000}") long expirationSeconds
    ) {
        this.secure = secure;
        this.sameSite = sameSite;
        this.expiration = Duration.ofSeconds(expirationSeconds);
    }

    public ResponseCookie create(String refreshToken, boolean persistent) {
        ResponseCookie.ResponseCookieBuilder cookie = baseCookie(refreshToken);
        if (persistent) {
            cookie.maxAge(expiration);
        }
        return cookie.build();
    }

    public ResponseCookie clear() {
        return baseCookie("")
                .maxAge(Duration.ZERO)
                .build();
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/api/auth");
    }
}
