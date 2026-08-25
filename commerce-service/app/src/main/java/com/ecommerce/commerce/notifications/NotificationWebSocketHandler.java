package com.ecommerce.commerce.notifications;

import com.ecommerce.commerce.configs.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Predicate;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final JwtService jwtService;
    private final JsonMapper jsonMapper;
    private final Map<String, NotificationClient> clients = new ConcurrentHashMap<>();

    public NotificationWebSocketHandler(JwtService jwtService, JsonMapper jsonMapper) {
        this.jwtService = jwtService;
        this.jsonMapper = jsonMapper;
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            JsonNode payload = jsonMapper.readTree(message.getPayload());
            Claims claims = jwtService.extractClaims(payload.path("token").asString());
            Number id = claims.get("id", Number.class);
            String role = claims.get("role", String.class);

            if (id == null || role == null) {
                session.close(CloseStatus.POLICY_VIOLATION);
                return;
            }

            clients.put(
                    session.getId(),
                    new NotificationClient(session, id.longValue(), role.toUpperCase(Locale.ROOT))
            );
        } catch (Exception exception) {
            clients.remove(session.getId());
            session.close(CloseStatus.POLICY_VIOLATION);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        clients.remove(session.getId());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        clients.remove(session.getId());
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    public void sendToAdmins(OrderNotification notification) {
        send(notification, client -> client.getRole().equals("ADMIN"));
    }

    public void sendToUser(Long userId, OrderNotification notification) {
        send(notification, client -> client.getUserId().equals(userId));
    }

    private void send(
            OrderNotification notification,
            Predicate<NotificationClient> recipient
    ) {
        String payload = jsonMapper.writeValueAsString(notification);
        clients.values().stream().filter(recipient).forEach(client -> {
            try {
                synchronized (client.getSession()) {
                    if (client.getSession().isOpen()) {
                        client.getSession().sendMessage(new TextMessage(payload));
                    }
                }
            } catch (Exception exception) {
                clients.remove(client.getSession().getId());
            }
        });
    }

    private static class NotificationClient {

        private final WebSocketSession session;
        private final Long userId;
        private final String role;

        private NotificationClient(WebSocketSession session, Long userId, String role) {
            this.session = session;
            this.userId = userId;
            this.role = role;
        }

        private WebSocketSession getSession() {
            return session;
        }

        private Long getUserId() {
            return userId;
        }

        private String getRole() {
            return role;
        }
    }
}
