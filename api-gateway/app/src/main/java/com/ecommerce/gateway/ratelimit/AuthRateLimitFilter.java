package com.ecommerce.gateway.ratelimit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class AuthRateLimitFilter implements GlobalFilter, Ordered {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthRateLimitFilter.class);
    private static final Map<String, Integer> LIMITS_PER_MINUTE = Map.of(
            "/api/auth/register", 5,
            "/api/auth/login", 10,
            "/api/auth/google", 10,
            "/api/auth/refresh", 30,
            "/api/auth/forgot-password", 5,
            "/api/auth/verify-reset-code", 10,
            "/api/auth/reset-password", 10
    );

    private final AuthRateLimitService rateLimitService;

    public AuthRateLimitFilter(AuthRateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (exchange.getRequest().getMethod() != HttpMethod.POST) {
            return chain.filter(exchange);
        }

        String path = exchange.getRequest().getPath().value();
        Integer limit = LIMITS_PER_MINUTE.get(path);
        if (limit == null) {
            return chain.filter(exchange);
        }

        return rateLimitService.increment(path.substring("/api/auth/".length()), clientAddress(exchange))
                .onErrorResume(exception -> {
                    LOGGER.warn(
                            "Redis rate limiter is unavailable; allowing auth request: {}",
                            exception.getMessage()
                    );
                    return Mono.just(-1L);
                })
                .flatMap(count -> {
                    if (count == -1) {
                        return chain.filter(exchange);
                    }

                    exchange.getResponse().getHeaders().set("X-RateLimit-Limit", limit.toString());
                    exchange.getResponse().getHeaders().set(
                            "X-RateLimit-Remaining",
                            Long.toString(Math.max(0, limit - count))
                    );

                    if (count <= limit) {
                        return chain.filter(exchange);
                    }

                    exchange.getResponse().getHeaders().set("Retry-After", "60");
                    return writeRateLimitError(exchange);
                });
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private String clientAddress(ServerWebExchange exchange) {
        InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
        if (remoteAddress == null || remoteAddress.getAddress() == null) {
            return "unknown";
        }
        return remoteAddress.getAddress().getHostAddress().replace(':', '_');
    }

    private Mono<Void> writeRateLimitError(ServerWebExchange exchange) {
        byte[] body = "{\"message\":\"Too many authentication attempts. Please try again in a minute.\"}"
                .getBytes(StandardCharsets.UTF_8);
        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        return exchange.getResponse().writeWith(Mono.just(
                exchange.getResponse().bufferFactory().wrap(body)
        ));
    }
}
