package com.ecommerce.app.repositories;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.List;

@Repository
public class PasswordResetStore {

    private static final String CODE_PREFIX = "password-reset:code:";
    private static final String ATTEMPT_PREFIX = "password-reset:attempt:";
    private static final String TOKEN_PREFIX = "password-reset:token:";
    private static final String COOLDOWN_PREFIX = "password-reset:cooldown:";
    private static final String RATE_PREFIX = "password-reset:rate:";

    private final StringRedisTemplate redisTemplate;
    private final Duration codeTtl;
    private final Duration tokenTtl;
    private final Duration resendDelay;
    private final int maxRequestsPerHour;

    public PasswordResetStore(
            StringRedisTemplate redisTemplate,
            @Value("${security.password-reset.code-ttl-seconds:300}") long codeTtlSeconds,
            @Value("${security.password-reset.token-ttl-seconds:600}") long tokenTtlSeconds,
            @Value("${security.password-reset.resend-delay-seconds:60}") long resendDelaySeconds,
            @Value("${security.password-reset.max-requests-per-hour:5}") int maxRequestsPerHour
    ) {
        this.redisTemplate = redisTemplate;
        this.codeTtl = Duration.ofSeconds(codeTtlSeconds);
        this.tokenTtl = Duration.ofSeconds(tokenTtlSeconds);
        this.resendDelay = Duration.ofSeconds(resendDelaySeconds);
        this.maxRequestsPerHour = maxRequestsPerHour;
    }

    public boolean allowRequest(String requestKey) {
        Boolean cooldownAccepted = redisTemplate.opsForValue().setIfAbsent(
                COOLDOWN_PREFIX + requestKey,
                "1",
                resendDelay
        );

        if (!Boolean.TRUE.equals(cooldownAccepted)) {
            return false;
        }

        String rateKey = RATE_PREFIX + requestKey;
        Long requestCount = redisTemplate.opsForValue().increment(rateKey);

        if (requestCount != null && requestCount == 1) {
            redisTemplate.expire(rateKey, Duration.ofHours(1));
        }

        return requestCount != null && requestCount <= maxRequestsPerHour;
    }

    public void saveCode(Long userId, String codeHash) {
        redisTemplate.opsForValue().set(CODE_PREFIX + userId, codeHash, codeTtl);
        redisTemplate.delete(ATTEMPT_PREFIX + userId);
    }

    public String getCodeHash(Long userId) {
        return redisTemplate.opsForValue().get(CODE_PREFIX + userId);
    }

    public long incrementAttempts(Long userId) {
        String key = ATTEMPT_PREFIX + userId;
        Long attempts = redisTemplate.opsForValue().increment(key);

        if (attempts != null && attempts == 1) {
            redisTemplate.expire(key, codeTtl);
        }

        return attempts == null ? 0 : attempts;
    }

    public void deleteCode(Long userId) {
        redisTemplate.delete(List.of(
                CODE_PREFIX + userId,
                ATTEMPT_PREFIX + userId
        ));
    }

    public void saveResetToken(String tokenHash, Long userId) {
        redisTemplate.opsForValue().set(
                TOKEN_PREFIX + tokenHash,
                userId.toString(),
                tokenTtl
        );
    }

    public Long consumeResetToken(String tokenHash) {
        String userId = redisTemplate.opsForValue().getAndDelete(TOKEN_PREFIX + tokenHash);

        try {
            return userId == null ? null : Long.valueOf(userId);
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
