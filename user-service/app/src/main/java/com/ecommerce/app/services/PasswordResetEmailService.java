package com.ecommerce.app.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class PasswordResetEmailService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetEmailService.class);

    private final RestClient restClient;
    private final String apiKey;
    private final String fromEmail;
    private final long codeTtlMinutes;

    public PasswordResetEmailService(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:}") String fromEmail,
            @Value("${security.password-reset.code-ttl-seconds:300}") long codeTtlSeconds
    ) {
        this.restClient = RestClient.create("https://api.resend.com");
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.codeTtlMinutes = Math.max(1, (codeTtlSeconds + 59) / 60);
    }

    public boolean isConfigured() {
        return !apiKey.isBlank() && !fromEmail.isBlank();
    }

    @Async
    public void sendCode(String email, String code) {
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1f2937">
                  <h2>Đặt lại mật khẩu QuyDung</h2>
                  <p>Mã xác nhận của bạn là:</p>
                  <p style="font-size:30px;font-weight:700;letter-spacing:8px">%s</p>
                  <p>Mã có hiệu lực trong %d phút và chỉ được sử dụng một lần.</p>
                  <p>Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.</p>
                </div>
                """.formatted(code, codeTtlMinutes);

        try {
            restClient.post()
                    .uri("/emails")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .body(Map.of(
                            "from", fromEmail,
                            "to", email,
                            "subject", "Mã xác nhận đặt lại mật khẩu QuyDung",
                            "html", html
                    ))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RuntimeException exception) {
            log.error("Could not send password reset email", exception);
        }
    }
}
