package com.ecommerce.gateway.ratelimit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.InetSocketAddress;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthRateLimitFilterTests {

    @Mock
    private AuthRateLimitService rateLimitService;

    @Mock
    private GatewayFilterChain chain;

    private AuthRateLimitFilter filter;

    @BeforeEach
    void setUp() {
        filter = new AuthRateLimitFilter(rateLimitService);
    }

    @Test
    void allowsRequestWithinLimit() {
        MockServerWebExchange exchange = loginExchange();
        when(rateLimitService.increment("login", "127.0.0.1")).thenReturn(Mono.just(1L));
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
        assertThat(exchange.getResponse().getHeaders().getFirst("X-RateLimit-Remaining")).isEqualTo("9");
    }

    @Test
    void rejectsRequestAboveLimit() {
        MockServerWebExchange exchange = loginExchange();
        when(rateLimitService.increment("login", "127.0.0.1")).thenReturn(Mono.just(11L));

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        verify(chain, never()).filter(exchange);
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(exchange.getResponse().getHeaders().getFirst("Retry-After")).isEqualTo("60");
        assertThat(exchange.getResponse().getBodyAsString().block()).contains("Too many authentication attempts");
    }

    @Test
    void allowsRequestWhenRedisIsUnavailable() {
        MockServerWebExchange exchange = loginExchange();
        when(rateLimitService.increment("login", "127.0.0.1"))
                .thenReturn(Mono.error(new IllegalStateException("Redis unavailable")));
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
    }

    private MockServerWebExchange loginExchange() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/auth/login")
                .remoteAddress(new InetSocketAddress("127.0.0.1", 50000))
                .build();
        return MockServerWebExchange.from(request);
    }
}
