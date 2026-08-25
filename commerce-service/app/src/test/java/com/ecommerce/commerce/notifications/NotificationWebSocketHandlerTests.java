package com.ecommerce.commerce.notifications;

import com.ecommerce.commerce.configs.JwtService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.json.JsonMapper;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationWebSocketHandlerTests {

    private static final String SECRET = "commerce-test-secret-with-at-least-32-bytes";

    @Test
    void routesNotificationsToAdminsAndTheTargetCustomer() throws Exception {
        NotificationWebSocketHandler handler = new NotificationWebSocketHandler(
                new JwtService(SECRET),
                JsonMapper.builder().build()
        );
        WebSocketSession admin = session("admin-session");
        WebSocketSession customer = session("customer-session");

        handler.handleMessage(admin, new TextMessage("{\"token\":\"" + token(1L, "Admin") + "\"}"));
        handler.handleMessage(customer, new TextMessage("{\"token\":\"" + token(2L, "Customer") + "\"}"));

        OrderNotification newOrder = notification(OrderNotificationType.NEW_ORDER, 2L);
        handler.sendToAdmins(newOrder);
        verify(admin).sendMessage(any(TextMessage.class));
        verify(customer, never()).sendMessage(any(TextMessage.class));

        clearInvocations(admin, customer);
        handler.sendToUser(2L, notification(OrderNotificationType.ORDER_CONFIRMED, 2L));
        verify(customer).sendMessage(any(TextMessage.class));
        verify(admin, never()).sendMessage(any(TextMessage.class));
    }

    @Test
    void dispatcherUsesTheCorrectNotificationAudience() {
        NotificationWebSocketHandler handler = mock(NotificationWebSocketHandler.class);
        OrderNotificationDispatcher dispatcher = new OrderNotificationDispatcher(handler);
        OrderNotification newOrder = notification(OrderNotificationType.NEW_ORDER, 2L);
        OrderNotification confirmedOrder = notification(OrderNotificationType.ORDER_CONFIRMED, 2L);

        dispatcher.dispatch(newOrder);
        dispatcher.dispatch(confirmedOrder);

        verify(handler).sendToAdmins(newOrder);
        verify(handler).sendToUser(2L, confirmedOrder);
    }

    private WebSocketSession session(String id) {
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn(id);
        when(session.isOpen()).thenReturn(true);
        return session;
    }

    private OrderNotification notification(OrderNotificationType type, Long userId) {
        return new OrderNotification(
                type,
                10L,
                "QD-TEST123",
                userId,
                "Test User",
                LocalDateTime.now()
        );
    }

    private String token(Long userId, String role) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .claim("id", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();
    }
}
