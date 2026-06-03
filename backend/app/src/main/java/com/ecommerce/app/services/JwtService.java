package com.ecommerce.app.services;

import com.ecommerce.app.entities.User;
import com.ecommerce.app.exceptions.BaseException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY = "my-super-secret-key-for-jwt-2026-very-long-kien";

    private static final long EXPIRATION_TIME = 3 * 1000 * 60 * 60 * 24;

    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("id", user.getId())
                .claim("role", user.getRole())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractRole(String token) {
        try {
            return extractClaims(token).get("role", String.class);
        } catch (Exception e) {
            throw new BaseException("Invalid or expired token", HttpStatus.UNAUTHORIZED);
        }
    }

    public String extractEmail(String token) {
        try {
            return extractClaims(token).getSubject();
        } catch (Exception e) {
            throw new BaseException("Invalid or expired token", HttpStatus.UNAUTHORIZED);
        }
    }
}