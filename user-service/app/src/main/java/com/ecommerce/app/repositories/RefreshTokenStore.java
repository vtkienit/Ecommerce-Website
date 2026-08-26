package com.ecommerce.app.repositories;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Set;

@Repository
public class RefreshTokenStore {

    private static final String TOKEN_PREFIX = "auth:refresh:token:";
    private static final String USER_PREFIX = "auth:refresh:user:";

    private final StringRedisTemplate redisTemplate;
    private final Duration tokenTtl;

    public RefreshTokenStore(
            StringRedisTemplate redisTemplate,
            @Value("${security.refresh-token.expiration-seconds:2592000}") long expirationSeconds
    ) {
        this.redisTemplate = redisTemplate;
        this.tokenTtl = Duration.ofSeconds(expirationSeconds);
    }

    public void save(String tokenHash, Long userId) {
        redisTemplate.opsForValue().set(tokenKey(tokenHash), userId.toString(), tokenTtl);
        redisTemplate.opsForSet().add(userKey(userId), tokenHash);
        redisTemplate.expire(userKey(userId), tokenTtl);
    }

    public Long consume(String tokenHash) {
        Long userId = parseUserId(redisTemplate.opsForValue().getAndDelete(tokenKey(tokenHash)));
        if (userId != null) {
            redisTemplate.opsForSet().remove(userKey(userId), tokenHash);
        }
        return userId;
    }

    public void delete(String tokenHash) {
        Long userId = parseUserId(redisTemplate.opsForValue().getAndDelete(tokenKey(tokenHash)));
        if (userId != null) {
            redisTemplate.opsForSet().remove(userKey(userId), tokenHash);
        }
    }

    public void deleteAll(Long userId) {
        Set<String> tokenHashes = redisTemplate.opsForSet().members(userKey(userId));
        if (tokenHashes != null && !tokenHashes.isEmpty()) {
            ArrayList<String> tokenKeys = new ArrayList<>(tokenHashes.size());
            tokenHashes.forEach(tokenHash -> tokenKeys.add(tokenKey(tokenHash)));
            redisTemplate.delete(tokenKeys);
        }
        redisTemplate.delete(userKey(userId));
    }

    private String tokenKey(String tokenHash) {
        return TOKEN_PREFIX + tokenHash;
    }

    private String userKey(Long userId) {
        return USER_PREFIX + userId;
    }

    private Long parseUserId(String value) {
        try {
            return value == null ? null : Long.valueOf(value);
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
