package com.ecommerce.commerce;

import com.ecommerce.commerce.clients.CatalogGateway;
import com.ecommerce.commerce.dtos.CatalogVariantSnapshot;
import com.ecommerce.commerce.entities.Inventory;
import com.ecommerce.commerce.repositories.CartRepository;
import com.ecommerce.commerce.repositories.InventoryRepository;
import com.ecommerce.commerce.repositories.OrderRepository;
import com.ecommerce.commerce.repositories.StockReservationRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import javax.crypto.SecretKey;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = {
        CommerceServiceApplication.class,
        CommerceFlowTests.CatalogStubConfiguration.class
})
@AutoConfigureMockMvc
class CommerceFlowTests {

    private static final String SECRET = "commerce-test-secret-with-at-least-32-bytes";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper objectMapper;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private StockReservationRepository reservationRepository;

    @BeforeEach
    void clearDatabase() {
        reservationRepository.deleteAll();
        orderRepository.deleteAll();
        cartRepository.deleteAll();
        inventoryRepository.deleteAll();
    }

    @Test
    void commerceEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void cartSupportsAddUpdateAndRemove() throws Exception {
        String token = token(7L);
        String body = mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variantId":101,"quantity":2}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalQuantity").value(2))
                .andExpect(jsonPath("$.subtotal").value(160000.00))
                .andExpect(jsonPath("$.items[0].productName").value("Cloud Pillow"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode cart = objectMapper.readTree(body);
        long itemId = cart.path("items").get(0).path("id").asLong();

        mockMvc.perform(patch("/api/cart/items/{id}", itemId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"quantity":3}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalQuantity").value(3))
                .andExpect(jsonPath("$.subtotal").value(240000.00));

        mockMvc.perform(delete("/api/cart/items/{id}", itemId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void checkoutReservesStockCreatesOrderAndClearsCart() throws Exception {
        String token = token(11L);
        addToCart(token, 101L, 2);

        String body = mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutJson()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.paymentStatus").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").value(160000.00))
                .andExpect(jsonPath("$.items[0].unitPrice").value(80000.00))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long orderId = objectMapper.readTree(body).path("id").asLong();

        mockMvc.perform(get("/api/cart").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0));

        mockMvc.perform(get("/api/orders").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(orderId));

        Inventory inventory = inventoryRepository.findByVariantId(101L).orElseThrow();
        assertThat(inventory.getReservedQuantity()).isEqualTo(2);
        assertThat(reservationRepository.findByOrderId(orderId)).hasSize(1);
    }

    @Test
    void cancellingOrderReleasesReservedStock() throws Exception {
        String token = token(21L);
        addToCart(token, 101L, 2);
        String orderBody = mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutJson()))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long orderId = objectMapper.readTree(orderBody).path("id").asLong();

        mockMvc.perform(patch("/api/orders/{id}/cancel", orderId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        Inventory inventory = inventoryRepository.findByVariantId(101L).orElseThrow();
        assertThat(inventory.getReservedQuantity()).isZero();
    }

    @Test
    void checkoutRejectsQuantityAboveAvailableStock() throws Exception {
        String token = token(31L);
        addToCart(token, 101L, 11);

        mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutJson()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Cloud Pillow only has 10 item(s) left"));

        assertThat(orderRepository.count()).isZero();
    }

    @Test
    void usersCannotReadAnotherUsersOrder() throws Exception {
        String ownerToken = token(41L);
        addToCart(ownerToken, 101L, 1);
        String orderBody = mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutJson()))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long orderId = objectMapper.readTree(orderBody).path("id").asLong();

        mockMvc.perform(get("/api/orders/{id}", orderId)
                        .header("Authorization", "Bearer " + token(42L)))
                .andExpect(status().isNotFound());
    }

    @Test
    void malformedJsonReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + token(51L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid JSON request"));
    }

    @Test
    void inventoryEndpointsRequireAdminRole() throws Exception {
        mockMvc.perform(get("/api/admin/inventory")
                        .header("Authorization", "Bearer " + token(61L)))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanSyncAndUpdateInventory() throws Exception {
        String adminToken = token(62L, "Admin");

        mockMvc.perform(get("/api/admin/inventory")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].onHandQuantity").value(0));

        mockMvc.perform(post("/api/admin/inventory/sync")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].onHandQuantity").value(10));

        mockMvc.perform(patch("/api/admin/inventory/101")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"onHandQuantity":7}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableQuantity").value(7));
    }

    @Test
    void stockCannotBeReducedBelowReservedQuantity() throws Exception {
        String customerToken = token(63L);
        addToCart(customerToken, 101L, 2);
        mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutJson()))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/admin/inventory/101")
                        .header("Authorization", "Bearer " + token(64L, "Admin"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"onHandQuantity":1}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Stock cannot be lower than the reserved quantity"));
    }

    private void addToCart(String token, Long variantId, int quantity) throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":" + variantId + ",\"quantity\":" + quantity + "}"))
                .andExpect(status().isOk());
    }

    private String checkoutJson() {
        return """
                {
                  "recipientName":"Kien Vu",
                  "recipientPhone":"0901234567",
                  "shippingAddress":"Ha Noi",
                  "paymentMethod":"COD"
                }
                """;
    }

    private String token(Long userId) {
        return token(userId, "Customer");
    }

    private String token(Long userId, String role) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject("customer@example.com")
                .claim("id", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key)
                .compact();
    }

    @TestConfiguration
    static class CatalogStubConfiguration {

        @Bean
        @Primary
        CatalogGateway catalogGateway() {
            return new CatalogGateway() {
                @Override
                public CatalogVariantSnapshot getVariant(Long variantId) {
                    return createVariant(variantId);
                }

                @Override
                public List<CatalogVariantSnapshot> getVariants() {
                    return List.of(createVariant(101L), createVariant(102L));
                }
            };
        }

        private CatalogVariantSnapshot createVariant(Long variantId) {
            CatalogVariantSnapshot variant = new CatalogVariantSnapshot();
            variant.setId(variantId);
            variant.setProductSlug("cloud-pillow");
            variant.setProductName("Cloud Pillow");
            variant.setImageUrl("pillow.jpg");
            variant.setSku("PILLOW-" + variantId);
            variant.setSize("40 x 60");
            variant.setColor("white");
            variant.setOriginalPrice(new BigDecimal("100000"));
            variant.setPrice(new BigDecimal("80000"));
            variant.setDiscountPercentage(20);
            return variant;
        }
    }
}
