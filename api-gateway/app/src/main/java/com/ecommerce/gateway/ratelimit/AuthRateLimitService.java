package com.ecommerce.gateway.ratelimit;

import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
public class AuthRateLimitService {

    private static final Duration WINDOW = Duration.ofMinutes(1);
    private static final String KEY_PREFIX = "gateway:auth-rate:";

    private final ReactiveStringRedisTemplate redisTemplate;

    public AuthRateLimitService(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Mono<Long> increment(String endpoint, String clientAddress) {
        long window = System.currentTimeMillis() / WINDOW.toMillis();
        String key = KEY_PREFIX + endpoint + ":" + clientAddress + ":" + window;

        return redisTemplate.opsForValue()
                .increment(key)
                .flatMap(count -> count == 1
                        ? redisTemplate.expire(key, WINDOW.plusSeconds(5)).thenReturn(count)
                        : Mono.just(count)
                );
    }
}
