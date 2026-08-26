package com.ecommerce.app.services;

import com.ecommerce.app.dtos.ForgotPasswordRequest;
import com.ecommerce.app.dtos.PasswordResetChallengeResponse;
import com.ecommerce.app.dtos.ResetPasswordRequest;
import com.ecommerce.app.dtos.ResetTokenResponse;
import com.ecommerce.app.dtos.VerifyResetCodeRequest;
import com.ecommerce.app.entities.User;
import com.ecommerce.app.exceptions.BaseException;
import com.ecommerce.app.repositories.PasswordResetStore;
import com.ecommerce.app.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Locale;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetStore resetStore;
    private final PasswordResetEmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final SecretKeySpec secretKey;
    private final SecureRandom secureRandom = new SecureRandom();
    private final int maxAttempts;
    private final long codeTtlSeconds;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetStore resetStore,
            PasswordResetEmailService emailService,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokenService,
            @Value("${security.password-reset.secret}") String secret,
            @Value("${security.password-reset.max-attempts:5}") int maxAttempts,
            @Value("${security.password-reset.code-ttl-seconds:300}") long codeTtlSeconds
    ) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("Password reset secret must contain at least 32 bytes");
        }

        this.userRepository = userRepository;
        this.resetStore = resetStore;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        this.maxAttempts = maxAttempts;
        this.codeTtlSeconds = codeTtlSeconds;
    }

    public PasswordResetChallengeResponse requestCode(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BaseException("Email does not exist", HttpStatus.NOT_FOUND));

        if (!emailService.isConfigured()) {
            throw new BaseException("Password reset email is not configured", HttpStatus.SERVICE_UNAVAILABLE);
        }

        String requestKey = hash("request:" + email);

        if (!resetStore.allowRequest(requestKey)) {
            throw new BaseException("Please wait before requesting another code", HttpStatus.TOO_MANY_REQUESTS);
        }

        String code = String.format("%06d", secureRandom.nextInt(1_000_000));
        resetStore.saveCode(user.getId(), hashCode(user.getId(), code));

        emailService.sendCode(email, code);
        return new PasswordResetChallengeResponse(codeTtlSeconds, maxAttempts);
    }

    public ResetTokenResponse verifyCode(VerifyResetCodeRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.getEmail()))
                .orElseThrow(() -> invalidCode(0));

        String savedCodeHash = resetStore.getCodeHash(user.getId());
        if (savedCodeHash == null) {
            throw invalidCode(0);
        }

        long attempts = resetStore.incrementAttempts(user.getId());
        if (attempts > maxAttempts) {
            resetStore.deleteCode(user.getId());
            throw invalidCode(0);
        }

        String providedCodeHash = hashCode(user.getId(), request.getCode());
        if (!secureEquals(savedCodeHash, providedCodeHash)) {
            int remainingAttempts = Math.max(0, maxAttempts - (int) attempts);

            if (remainingAttempts == 0) {
                resetStore.deleteCode(user.getId());
            }

            throw invalidCode(remainingAttempts);
        }

        resetStore.deleteCode(user.getId());

        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String resetToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        resetStore.saveResetToken(hash("token:" + resetToken), user.getId());
        return new ResetTokenResponse(resetToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BaseException("Password confirmation does not match", HttpStatus.BAD_REQUEST);
        }

        Long userId = resetStore.consumeResetToken(hash("token:" + request.getResetToken().trim()));
        if (userId == null) {
            throw new BaseException("Invalid or expired reset token", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException("Invalid or expired reset token", HttpStatus.BAD_REQUEST));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenService.revokeAll(user.getId());
    }

    private String hashCode(Long userId, String code) {
        return hash("code:" + userId + ":" + code);
    }

    private String hash(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKey);
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Could not create secure password reset hash", exception);
        }
    }

    private boolean secureEquals(String first, String second) {
        return MessageDigest.isEqual(
                first.getBytes(StandardCharsets.UTF_8),
                second.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private BaseException invalidCode(int remainingAttempts) {
        return new BaseException(
                "Invalid or expired reset code",
                HttpStatus.BAD_REQUEST,
                remainingAttempts
        );
    }
}
