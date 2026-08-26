package com.ecommerce.gateway.configs;

import com.ecommerce.gateway.security.JwtTokenService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.authentication.ServerAuthenticationEntryPointFailureHandler;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Configuration
public class SecurityConfig {

    private static final String BEARER_PREFIX = "Bearer ";

    @Bean
    public ReactiveAuthenticationManager jwtAuthenticationManager(JwtTokenService jwtTokenService) {
        return authentication -> Mono.fromCallable(() ->
                jwtTokenService.authenticate((String) authentication.getCredentials())
        );
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            ReactiveAuthenticationManager jwtAuthenticationManager
    ) {
        AuthenticationWebFilter jwtFilter = new AuthenticationWebFilter(jwtAuthenticationManager);
        jwtFilter.setServerAuthenticationConverter(this::convertBearerToken);
        jwtFilter.setSecurityContextRepository(NoOpServerSecurityContextRepository.getInstance());
        jwtFilter.setAuthenticationFailureHandler(new ServerAuthenticationEntryPointFailureHandler(
                (exchange, exception) -> writeError(exchange, HttpStatus.UNAUTHORIZED, "Invalid or expired token")
        ));

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .requestCache(ServerHttpSecurity.RequestCacheSpec::disable)
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((exchange, exception) ->
                                writeError(exchange, HttpStatus.UNAUTHORIZED, "Authentication is required")
                        )
                        .accessDeniedHandler((exchange, exception) ->
                                writeError(exchange, HttpStatus.FORBIDDEN, "Access denied")
                        )
                )
                .authorizeExchange(auth -> auth
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers(
                                "/error",
                                "/actuator/health",
                                "/actuator/health/**",
                                "/actuator/info",
                                "/api/auth/**",
                                "/ws/notifications"
                        ).permitAll()
                        .pathMatchers(HttpMethod.GET,
                                "/api/categories", "/api/categories/**",
                                "/api/products", "/api/products/**",
                                "/api/variants", "/api/variants/**",
                                "/api/flash-sales", "/api/flash-sales/**",
                                "/api/inventory", "/api/inventory/**"
                        ).permitAll()
                        .pathMatchers(HttpMethod.POST, "/api/payments/payos/webhook").permitAll()
                        .pathMatchers("/api/admin/**", "/api/users").hasRole("ADMIN")
                        .anyExchange().authenticated()
                )
                .addFilterAt(jwtFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }

    private Mono<Authentication> convertBearerToken(ServerWebExchange exchange) {
        String authorization = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authorization == null || authorization.isBlank()) {
            return Mono.empty();
        }

        if (!authorization.startsWith(BEARER_PREFIX) || authorization.length() == BEARER_PREFIX.length()) {
            return Mono.just(new UsernamePasswordAuthenticationToken("", ""));
        }

        String token = authorization.substring(BEARER_PREFIX.length()).trim();
        return Mono.just(new UsernamePasswordAuthenticationToken(token, token));
    }

    private Mono<Void> writeError(ServerWebExchange exchange, HttpStatus status, String message) {
        byte[] body = ("{\"message\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        return exchange.getResponse().writeWith(Mono.just(
                exchange.getResponse().bufferFactory().wrap(body)
        ));
    }
}
