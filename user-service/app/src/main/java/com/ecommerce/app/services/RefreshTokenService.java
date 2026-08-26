package com.ecommerce.app.services;

import com.ecommerce.app.dtos.RefreshTokenData;
import com.ecommerce.app.entities.User;
import com.ecommerce.app.exceptions.BaseException;
import com.ecommerce.app.repositories.RefreshTokenStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class RefreshTokenService {

    private final RefreshTokenStore tokenStore;
    private final SecureRandom secureRandom = new SecureRandom();
    private final long expirationSeconds;

    public RefreshTokenService(
            RefreshTokenStore tokenStore,
            @Value("${security.refresh-token.expiration-seconds:2592000}") long expirationSeconds
    ) {
        this.tokenStore = tokenStore;
        this.expirationSeconds = expirationSeconds;
    }

    public String create(User user, boolean persistent) {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        tokenStore.save(hash(token), user.getId(), persistent);
        return token;
    }

    public RefreshTokenData consume(String token) {
        if (token == null || token.isBlank()) {
            throw invalidToken();
        }

        RefreshTokenData tokenData = tokenStore.consume(hash(token.trim()));
        if (tokenData == null) {
            throw invalidToken();
        }
        return tokenData;
    }

    public void revoke(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        tokenStore.delete(hash(token.trim()));
    }

    public void revokeAll(Long userId) {
        tokenStore.deleteAll(userId);
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }

    private String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private BaseException invalidToken() {
        return new BaseException("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED);
    }
}
