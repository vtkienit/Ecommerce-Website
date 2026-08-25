package com.ecommerce.commerce.configs;

import com.ecommerce.commerce.notifications.NotificationWebSocketHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import java.util.Arrays;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final NotificationWebSocketHandler notificationHandler;
    private final String[] allowedOrigins;

    public WebSocketConfig(
            NotificationWebSocketHandler notificationHandler,
            @Value("${app.cors.allowed-origins}") String allowedOrigins
    ) {
        this.notificationHandler = notificationHandler;
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toArray(String[]::new);
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry
                .addHandler(notificationHandler, "/ws/notifications")
                .setAllowedOrigins(allowedOrigins);
    }
}
