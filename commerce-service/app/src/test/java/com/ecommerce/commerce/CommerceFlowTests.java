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
import com.ecommerce.commerce.repositories.ReturnRequestRepository;
import com.ecommerce.commerce.repositories.StockReservationRepository;
import com.ecommerce.commerce.repositories.VoucherRepository;
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

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private ReturnRequestRepository returnRequestRepository;

    @BeforeEach
    void clearDatabase() {
        returnRequestRepository.deleteAll();
        reservationRepository.deleteAll();
        orderRepository.deleteAll();
        voucherRepository.deleteAll();
        cartRepository.deleteAll();
        inventoryRepository.deleteAll();
    }

    @Test
    void commerceEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void inventoryAvailabilityIsPublicAndExcludesReservedStock() throws Exception {
        Inventory inventory = new Inventory();
        inventory.setVariantId(101L);
        inventory.setSku("CLOUD-PILLOW-WHITE");
        inventory.setOnHandQuantity(10);
        inventory.setReservedQuantity(3);
        inventoryRepository.save(inventory);

        mockMvc.perform(get("/api/inventory/availability")
                        .param("variantIds", "101", "999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].variantId").value(101))
                .andExpect(jsonPath("$[0].availableQuantity").value(7))
                .andExpect(jsonPath("$[1].variantId").value(999))
                .andExpect(jsonPath("$[1].availableQuantity").value(0));
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
    void adminCanManageVouchers() throws Exception {
        String adminToken = token(22L, "Admin");

        mockMvc.perform(get("/api/admin/vouchers")
                        .header("Authorization", "Bearer " + token(23L)))
                .andExpect(status().isForbidden());

        String body = mockMvc.perform(post("/api/admin/vouchers")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(voucherJson("WELCOME10", 10)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("WELCOME10"))
                .andExpect(jsonPath("$.active").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long voucherId = objectMapper.readTree(body).path("id").asLong();

        mockMvc.perform(patch("/api/admin/vouchers/{id}", voucherId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(voucherJson("WELCOME15", 15)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("WELCOME15"))
                .andExpect(jsonPath("$.quantity").value(15));

        mockMvc.perform(get("/api/admin/vouchers")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(voucherId))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.last").value(true));

        mockMvc.perform(delete("/api/admin/vouchers/{id}", voucherId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
        assertThat(voucherRepository.count()).isZero();
    }

    @Test
    void voucherPreviewCheckoutAndCancellationKeepUsageConsistent() throws Exception {
        String adminToken = token(24L, "Admin");
        String customerToken = token(25L);
        mockMvc.perform(post("/api/admin/vouchers")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(voucherJson("SAVE10", 3)))
                .andExpect(status().isCreated());

        addToCart(customerToken, 101L, 2);
        mockMvc.perform(post("/api/vouchers/preview")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"save10\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subtotal").value(160000.00))
                .andExpect(jsonPath("$.discountAmount").value(12000.00))
                .andExpect(jsonPath("$.totalAmount").value(148000.00));

        String orderBody = mockMvc.perform(post("/api/orders/checkout")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutJson("COD", "save10")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.voucherCode").value("SAVE10"))
                .andExpect(jsonPath("$.discountAmount").value(12000.00))
                .andExpect(jsonPath("$.totalAmount").value(148000.00))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long orderId = objectMapper.readTree(orderBody).path("id").asLong();
        assertThat(voucherRepository.findByCodeIgnoreCase("SAVE10").orElseThrow().getUsedCount()).isOne();

        mockMvc.perform(patch("/api/orders/{id}/cancel", orderId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
        assertThat(voucherRepository.findByCodeIgnoreCase("SAVE10").orElseThrow().getUsedCount()).isZero();
    }

    @Test
    void cartRejectsQuantityAboveAvailableStock() throws Exception {
        String token = token(31L);
        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":101,\"quantity\":11}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Cloud Pillow only has 10 item(s) left"));

        assertThat(cartRepository.count()).isZero();
        assertThat(orderRepository.count()).isZero();
    }

    @Test
    void cartRejectsUpdateAboveAvailableStockAndKeepsCurrentQuantity() throws Exception {
        String token = token(32L);
        addToCart(token, 101L, 2);
        long itemId = cartRepository.findByUserId(32L).orElseThrow().getItems().getFirst().getId();

        mockMvc.perform(patch("/api/cart/items/{id}", itemId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":11}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Cloud Pillow only has 10 item(s) left"));

        mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(2));
    }

    @Test
    void cartRejectsOutOfStockVariant() throws Exception {
        Inventory inventory = new Inventory();
        inventory.setVariantId(101L);
        inventory.setSku("CLOUD-PILLOW-WHITE");
        inventory.setOnHandQuantity(3);
        inventory.setReservedQuantity(3);
        inventoryRepository.save(inventory);

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + token(33L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variantId\":101,\"quantity\":1}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Cloud Pillow only has 0 item(s) left"));
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
                .andExpect(jsonPath("$.content[0].onHandQuantity").value(0))
                .andExpect(jsonPath("$.size").value(10));

        mockMvc.perform(post("/api/admin/inventory/sync")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].onHandQuantity").value(10));

        mockMvc.perform(patch("/api/admin/inventory/101")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"onHandQuantity":7}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availableQuantity").value(7));

        mockMvc.perform(post("/api/admin/inventory/sync")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].onHandQuantity").value(7));
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
                .andExpect(jsonPath("$.content[0].id").value(orderId))
                .andExpect(jsonPath("$.content[0].userId").value(74))
                .andExpect(jsonPath("$.totalElements").value(1));

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
    void adminDashboardSummarizesOrdersAndLowStock() throws Exception {
        String adminToken = token(76L, "Admin");
        long deliveredOrderId = checkout(token(77L), 101L, 1);
        deliverOrder(adminToken, deliveredOrderId);
        long pendingOrderId = checkout(token(78L), 102L, 1);

        Inventory lowStock = inventoryRepository.findByVariantId(102L).orElseThrow();
        lowStock.setOnHandQuantity(5);
        inventoryRepository.save(lowStock);

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + token(79L)))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").value(80000.00))
                .andExpect(jsonPath("$.monthlyRevenue").value(80000.00))
                .andExpect(jsonPath("$.totalOrders").value(2))
                .andExpect(jsonPath("$.pendingOrders").value(1))
                .andExpect(jsonPath("$.lowStockVariants").value(1))
                .andExpect(jsonPath("$.ordersByStatus.PENDING").value(1))
                .andExpect(jsonPath("$.ordersByStatus.DELIVERED").value(1))
                .andExpect(jsonPath("$.recentOrders[0].id").value(pendingOrderId))
                .andExpect(jsonPath("$.lowStockItems[0].variantId").value(102))
                .andExpect(jsonPath("$.lowStockItems[0].availableQuantity").value(4));
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

    @Test
    void returnRequestRequiresDeliveredOwnedOrder() throws Exception {
        String customerToken = token(86L);
        String adminToken = token(87L, "Admin");
        long orderId = checkout(customerToken, 101L, 1);

        mockMvc.perform(post("/api/orders/{id}/returns", orderId)
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"The product does not fit my bed\"}"))
                .andExpect(status().isConflict());

        deliverOrder(adminToken, orderId);

        mockMvc.perform(post("/api/orders/{id}/returns", orderId)
                        .header("Authorization", "Bearer " + token(88L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"The product does not fit my bed\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void customerAndAdminCanCompleteReturnFlow() throws Exception {
        String customerToken = token(89L);
        String adminToken = token(90L, "Admin");
        long orderId = checkout(customerToken, 101L, 2);
        deliverOrder(adminToken, orderId);

        mockMvc.perform(get("/api/orders/{id}", orderId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.returnEligible").value(true))
                .andExpect(jsonPath("$.returnRequest").doesNotExist());

        String body = mockMvc.perform(post("/api/orders/{id}/returns", orderId)
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"The mattress is too firm for my sleep\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("REQUESTED"))
                .andExpect(jsonPath("$.orderId").value(orderId))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long requestId = objectMapper.readTree(body).path("id").asLong();

        mockMvc.perform(get("/api/admin/returns")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/returns?status=REQUESTED")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(requestId))
                .andExpect(jsonPath("$.first").value(true));

        updateReturnStatus(adminToken, requestId, "APPROVED", "Return accepted", "APPROVED");

        Inventory shippedInventory = inventoryRepository.findByVariantId(101L).orElseThrow();
        assertThat(shippedInventory.getOnHandQuantity()).isEqualTo(8);

        updateReturnStatus(adminToken, requestId, "COMPLETED", "Items received", "COMPLETED");

        Inventory restoredInventory = inventoryRepository.findByVariantId(101L).orElseThrow();
        assertThat(restoredInventory.getOnHandQuantity()).isEqualTo(10);
        assertThat(paymentRepository.findAll().getFirst().getStatus()).isEqualTo(PaymentStatus.REFUNDED);

        mockMvc.perform(get("/api/orders/{id}", orderId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.returnEligible").value(false))
                .andExpect(jsonPath("$.returnRequest.status").value("COMPLETED"))
                .andExpect(jsonPath("$.paymentStatus").value("REFUNDED"));
    }

    @Test
    void rejectingReturnRequiresAdminNote() throws Exception {
        String customerToken = token(91L);
        String adminToken = token(92L, "Admin");
        long orderId = checkout(customerToken, 101L, 1);
        deliverOrder(adminToken, orderId);

        String body = mockMvc.perform(post("/api/orders/{id}/returns", orderId)
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"The item arrived with visible damage\"}"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long requestId = objectMapper.readTree(body).path("id").asLong();

        mockMvc.perform(patch("/api/admin/returns/{id}/status", requestId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"REJECTED\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("A rejection reason is required"));
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

    private void deliverOrder(String adminToken, long orderId) throws Exception {
        updateOrderStatus(adminToken, orderId, "CONFIRMED", "CONFIRMED");
        updateOrderStatus(adminToken, orderId, "PROCESSING", "PROCESSING");
        updateOrderStatus(adminToken, orderId, "SHIPPED", "SHIPPED");
        updateOrderStatus(adminToken, orderId, "DELIVERED", "DELIVERED");
    }

    private void updateReturnStatus(
            String token,
            long requestId,
            String requestedStatus,
            String adminNote,
            String expectedStatus
    ) throws Exception {
        mockMvc.perform(patch("/api/admin/returns/{id}/status", requestId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status":"%s","adminNote":"%s"}
                                """.formatted(requestedStatus, adminNote)))
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

    private String checkoutJson(String paymentMethod, String voucherCode) {
        return """
                {
                  "recipientName":"Kien Vu",
                  "recipientPhone":"0901234567",
                  "shippingAddress":"Ha Noi",
                  "paymentMethod":"%s",
                  "voucherCode":"%s"
                }
                """.formatted(paymentMethod, voucherCode);
    }

    private String voucherJson(String code, int quantity) {
        return """
                {
                  "code":"%s",
                  "description":"Ten percent off",
                  "discountType":"PERCENTAGE",
                  "discountValue":10,
                  "minOrderAmount":100000,
                  "maxDiscountAmount":12000,
                  "quantity":%d,
                  "startDate":"2020-01-01T00:00:00",
                  "endDate":"2099-12-31T23:59:59"
                }
                """.formatted(code, quantity);
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
