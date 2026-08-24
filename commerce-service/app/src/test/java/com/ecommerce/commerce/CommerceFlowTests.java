package com.ecommerce.commerce;

import com.ecommerce.commerce.clients.CatalogGateway;
import com.ecommerce.commerce.clients.PayOSGateway;
import com.ecommerce.commerce.dtos.CatalogVariantSnapshot;
import com.ecommerce.commerce.entities.Inventory;
import com.ecommerce.commerce.entities.PaymentStatus;
import com.ecommerce.commerce.entities.StockReservationStatus;
import com.ecommerce.commerce.repositories.CartRepository;
import com.ecommerce.commerce.repositories.InventoryRepository;
import com.ecommerce.commerce.repositories.OrderRepository;
import com.ecommerce.commerce.repositories.PaymentRepository;
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
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import javax.crypto.SecretKey;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.ecommerce.commerce.exceptions.CommerceException;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;
import vn.payos.model.webhooks.WebhookData;

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

    @Autowired
    private PaymentRepository paymentRepository;

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
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.userId").value(11))
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
        assertThat(reservationRepository.findByOrderId(orderId))
                .singleElement()
                .extracting("status")
                .isEqualTo(StockReservationStatus.ACTIVE);
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
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.paymentStatus").value("CANCELLED"));

        Inventory inventory = inventoryRepository.findByVariantId(101L).orElseThrow();
        assertThat(inventory.getReservedQuantity()).isZero();
        assertThat(reservationRepository.findByOrderId(orderId).getFirst().getStatus())
                .isEqualTo(StockReservationStatus.RELEASED);
        assertThat(paymentRepository.findAll().getFirst().getStatus()).isEqualTo(PaymentStatus.CANCELLED);
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

    @Test
    void orderManagementRequiresAdminRole() throws Exception {
        mockMvc.perform(get("/api/admin/orders")
                        .header("Authorization", "Bearer " + token(71L)))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCannotSkipOrderLifecycleSteps() throws Exception {
        String customerToken = token(72L);
        long orderId = checkout(customerToken, 101L, 1);

        mockMvc.perform(patch("/api/admin/orders/{id}/status", orderId)
                        .header("Authorization", "Bearer " + token(73L, "Admin"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"SHIPPED"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Order cannot move from PENDING to SHIPPED"));
    }

    @Test
    void adminCanCompleteOrderLifecycle() throws Exception {
        String customerToken = token(74L);
        long orderId = checkout(customerToken, 101L, 2);
        String adminToken = token(75L, "Admin");

        mockMvc.perform(get("/api/admin/orders?status=PENDING")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(orderId))
                .andExpect(jsonPath("$[0].userId").value(74));

        updateOrderStatus(adminToken, orderId, "CONFIRMED", "CONFIRMED");
        assertThat(reservationRepository.findByOrderId(orderId).getFirst().getStatus())
                .isEqualTo(StockReservationStatus.CONFIRMED);

        updateOrderStatus(adminToken, orderId, "PROCESSING", "PROCESSING");
        updateOrderStatus(adminToken, orderId, "SHIPPED", "SHIPPED");

        Inventory shippedInventory = inventoryRepository.findByVariantId(101L).orElseThrow();
        assertThat(shippedInventory.getOnHandQuantity()).isEqualTo(8);
        assertThat(shippedInventory.getReservedQuantity()).isZero();
        assertThat(reservationRepository.findByOrderId(orderId).getFirst().getStatus())
                .isEqualTo(StockReservationStatus.CONSUMED);

        updateOrderStatus(adminToken, orderId, "DELIVERED", "DELIVERED");
        assertThat(paymentRepository.findAll().getFirst().getStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    void onlineCheckoutCreatesPayOSPaymentLink() throws Exception {
        String token = token(81L);
        addToCart(token, 101L, 1);

        mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutJson("PAYOS")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentMethod").value("PAYOS"))
                .andExpect(jsonPath("$.paymentStatus").value("PENDING"))
                .andExpect(jsonPath("$.checkoutUrl").value(org.hamcrest.Matchers.startsWith("https://pay.test/")));
    }

    @Test
    void validPayOSWebhookMarksOnlinePaymentAsPaid() throws Exception {
        String token = token(82L);
        long orderId = checkout(token, 101L, 1, "PAYOS");

        mockMvc.perform(post("/api/payments/payos/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookJson(orderId, 80000, "valid")))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/orders/{id}", orderId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("PAID"));
        assertThat(paymentRepository.findAll().getFirst().getProviderReference())
                .isEqualTo("bank-ref-" + orderId);
    }

    @Test
    void payOSWebhookRejectsInvalidSignatureOrAmount() throws Exception {
        String token = token(83L);
        long orderId = checkout(token, 101L, 1, "PAYOS");

        mockMvc.perform(post("/api/payments/payos/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookJson(orderId, 80000, "invalid")))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/payments/payos/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookJson(orderId, 1, "valid")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("payOS payment does not match the order"));
        assertThat(paymentRepository.findAll().getFirst().getStatus()).isEqualTo(PaymentStatus.PENDING);
    }

    @Test
    void signedPayOSWebhookForUnknownOrderIsAcknowledged() throws Exception {
        mockMvc.perform(post("/api/payments/payos/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookJson(999999L, 1000, "valid")))
                .andExpect(status().isOk());
    }

    @Test
    void onlineOrderCanBeConfirmedOnlyAfterPaymentSync() throws Exception {
        String customerToken = token(84L);
        long orderId = checkout(customerToken, 101L, 1, "PAYOS");
        String adminToken = token(85L, "Admin");

        mockMvc.perform(patch("/api/admin/orders/{id}/status", orderId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"CONFIRMED"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Online payment must be completed before confirming the order"
                ));

        mockMvc.perform(post("/api/orders/{id}/payment/sync", orderId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentStatus").value("PAID"));

        updateOrderStatus(adminToken, orderId, "CONFIRMED", "CONFIRMED");
    }

    private void addToCart(String token, Long variantId, int quantity) throws Exception {
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":" + variantId + ",\"quantity\":" + quantity + "}"))
                .andExpect(status().isOk());
    }

    private long checkout(String token, Long variantId, int quantity) throws Exception {
        return checkout(token, variantId, quantity, "COD");
    }

    private long checkout(String token, Long variantId, int quantity, String paymentMethod) throws Exception {
        addToCart(token, variantId, quantity);
        String body = mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutJson(paymentMethod)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(body).path("id").asLong();
    }

    private void updateOrderStatus(
            String token,
            long orderId,
            String requestedStatus,
            String expectedStatus
    ) throws Exception {
        mockMvc.perform(patch("/api/admin/orders/{id}/status", orderId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"" + requestedStatus + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(expectedStatus));
    }

    private String checkoutJson() {
        return checkoutJson("COD");
    }

    private String checkoutJson(String paymentMethod) {
        return """
                {
                  "recipientName":"Kien Vu",
                  "recipientPhone":"0901234567",
                  "shippingAddress":"Ha Noi",
                  "paymentMethod":"%s"
                }
                """.formatted(paymentMethod);
    }

    private String webhookJson(long orderId, long amount, String signature) {
        return """
                {
                  "code":"00",
                  "desc":"success",
                  "success":true,
                  "data":{
                    "orderCode":%d,
                    "amount":%d,
                    "paymentLinkId":"payos-%d",
                    "reference":"bank-ref-%d",
                    "code":"00"
                  },
                  "signature":"%s"
                }
                """.formatted(orderId, amount, orderId, orderId, signature);
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

        @Bean
        @Primary
        PayOSGateway payOSGateway() {
            return new PayOSGateway() {
                private final Map<Long, Long> amounts = new ConcurrentHashMap<>();

                @Override
                public CreatePaymentLinkResponse createPaymentLink(CreatePaymentLinkRequest request) {
                    amounts.put(request.getOrderCode(), request.getAmount());
                    CreatePaymentLinkResponse response = new CreatePaymentLinkResponse();
                    response.setOrderCode(request.getOrderCode());
                    response.setAmount(request.getAmount());
                    response.setPaymentLinkId("payos-" + request.getOrderCode());
                    response.setCheckoutUrl("https://pay.test/" + request.getOrderCode());
                    response.setStatus(PaymentLinkStatus.PENDING);
                    return response;
                }

                @Override
                @SuppressWarnings("unchecked")
                public WebhookData verifyWebhook(Object payload) {
                    Map<String, Object> webhook = (Map<String, Object>) payload;
                    if (!"valid".equals(webhook.get("signature"))) {
                        throw new CommerceException("Invalid payOS webhook signature", HttpStatus.BAD_REQUEST);
                    }
                    Map<String, Object> data = (Map<String, Object>) webhook.get("data");
                    WebhookData result = new WebhookData();
                    result.setOrderCode(((Number) data.get("orderCode")).longValue());
                    result.setAmount(((Number) data.get("amount")).longValue());
                    result.setPaymentLinkId((String) data.get("paymentLinkId"));
                    result.setReference((String) data.get("reference"));
                    result.setCode((String) data.get("code"));
                    return result;
                }

                @Override
                public PaymentLink getPaymentLink(Long orderCode) {
                    long amount = amounts.get(orderCode);
                    PaymentLink paymentLink = new PaymentLink();
                    paymentLink.setId("payos-" + orderCode);
                    paymentLink.setOrderCode(orderCode);
                    paymentLink.setAmount(amount);
                    paymentLink.setAmountPaid(amount);
                    paymentLink.setStatus(PaymentLinkStatus.PAID);
                    return paymentLink;
                }

                @Override
                public void cancelPaymentLink(Long orderCode) {
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
