package com.ecommerce.gateway;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.reactive.server.WebTestClient;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@AutoConfigureWebTestClient
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "security.jwt.secret=test-secret-that-is-at-least-32-bytes-long",
                "management.health.redis.enabled=false"
        }
)
class ApiGatewayApplicationTests {

    private static final String SECRET = "test-secret-that-is-at-least-32-bytes-long";

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void contextLoads() {
    }

    @Test
    void protectedRouteRequiresAuthentication() {
        webTestClient.get()
                .uri("/api/cart")
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.message").isEqualTo("Authentication is required");
    }

    @Test
    void customerCannotAccessAdminRoute() {
        webTestClient.get()
                .uri("/api/admin/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token("Customer"))
                .exchange()
                .expectStatus().isForbidden()
                .expectBody()
                .jsonPath("$.message").isEqualTo("Access denied");
    }

    @Test
    void invalidTokenIsRejected() {
        webTestClient.get()
                .uri("/api/cart")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token")
                .exchange()
                .expectStatus().isUnauthorized()
                .expectBody()
                .jsonPath("$.message").isEqualTo("Invalid or expired token");
    }

    @Test
    void corsAllowsCredentialsOnlyForTheConfiguredFrontend() {
        webTestClient.options()
                .uri("/api/auth/login")
                .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                .exchange()
                .expectStatus().isOk()
                .expectHeader().valueEquals(
                        HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
                        "http://localhost:5173"
                )
                .expectHeader().valueEquals(
                        HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS,
                        "true"
                );
    }

    private String token(String role) {
        return Jwts.builder()
                .subject("customer@example.com")
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }
}
