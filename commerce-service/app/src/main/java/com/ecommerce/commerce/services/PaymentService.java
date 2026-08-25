package com.ecommerce.commerce.services;

import com.ecommerce.commerce.clients.PayOSGateway;
import com.ecommerce.commerce.entities.Order;
import com.ecommerce.commerce.entities.Payment;
import com.ecommerce.commerce.entities.PaymentStatus;
import com.ecommerce.commerce.exceptions.CommerceException;
import com.ecommerce.commerce.repositories.OrderRepository;
import com.ecommerce.commerce.repositories.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.v2.paymentRequests.PaymentLinkStatus;
import vn.payos.model.webhooks.WebhookData;

import java.math.BigDecimal;
import java.util.Map;

@Service
@Transactional
public class PaymentService {

    public static final String COD = "COD";
    public static final String PAYOS = "PAYOS";

    private final PayOSGateway payOSGateway;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final String returnUrl;
    private final String cancelUrl;

    public PaymentService(
            PayOSGateway payOSGateway,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            @Value("${payment.payos.return-url}") String returnUrl,
            @Value("${payment.payos.cancel-url}") String cancelUrl
    ) {
        this.payOSGateway = payOSGateway;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.returnUrl = returnUrl;
        this.cancelUrl = cancelUrl;
    }

    public boolean supports(String paymentMethod) {
        return COD.equals(paymentMethod) || PAYOS.equals(paymentMethod);
    }

    public void createOnlinePayment(Order order, Payment payment) {
        long amount = toVnd(payment.getAmount());
        CreatePaymentLinkRequest request = CreatePaymentLinkRequest
                .builder()
                .orderCode(order.getId())
                .amount(amount)
                .description("QD " + order.getId())
                .buyerName(order.getRecipientName())
                .buyerPhone(order.getRecipientPhone())
                .buyerAddress(order.getShippingAddress())
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .build();

        CreatePaymentLinkResponse response = payOSGateway.createPaymentLink(request);
        if (!order.getId().equals(response.getOrderCode())
                || response.getAmount() == null
                || response.getAmount() != amount
                || response.getPaymentLinkId() == null
                || response.getCheckoutUrl() == null) {
            throw new CommerceException("payOS returned invalid payment information", HttpStatus.BAD_GATEWAY);
        }

        payment.setExternalTransactionId(response.getPaymentLinkId());
        payment.setCheckoutUrl(response.getCheckoutUrl());
    }

    public void handleWebhook(Map<String, Object> payload) {
        WebhookData data = payOSGateway.verifyWebhook(payload);
        if (!"00".equals(data.getCode())) return;

        Order order = orderRepository.findByIdForUpdate(data.getOrderCode()).orElse(null);
        if (order == null) return;
        Payment payment = getPayment(order);
        validatePayment(payment, data.getAmount(), data.getPaymentLinkId());

        if (payment.getStatus() != PaymentStatus.PAID) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setProviderReference(data.getReference());
        }
    }

    public void syncOnlinePayment(Order order) {
        Payment payment = getPayment(order);
        if (!PAYOS.equals(payment.getPaymentMethod()) || payment.getStatus() == PaymentStatus.PAID) return;

        PaymentLink paymentLink = payOSGateway.getPaymentLink(order.getId());
        if (paymentLink.getStatus() != PaymentLinkStatus.PAID) return;

        Long paidAmount = paymentLink.getAmountPaid() == null
                ? paymentLink.getAmount()
                : paymentLink.getAmountPaid();
        validatePayment(payment, paidAmount, paymentLink.getId());
        payment.setStatus(PaymentStatus.PAID);
    }

    public void ensureOrderCanBeConfirmed(Order order) {
        Payment payment = getPayment(order);
        if (PAYOS.equals(payment.getPaymentMethod()) && payment.getStatus() != PaymentStatus.PAID) {
            throw new CommerceException(
                    "Online payment must be completed before confirming the order",
                    HttpStatus.CONFLICT
            );
        }
    }

    public void cancelPendingPayment(Order order) {
        Payment payment = getPayment(order);
        if (!PAYOS.equals(payment.getPaymentMethod())) return;
        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new CommerceException(
                    "Paid online orders require a refund before cancellation",
                    HttpStatus.CONFLICT
            );
        }
        if (payment.getStatus() == PaymentStatus.PENDING && payment.getExternalTransactionId() != null) {
            payOSGateway.cancelPaymentLink(order.getId());
        }
    }

    public void markRefundCompleted(Order order) {
        Payment payment = getPayment(order);
        if (payment.getStatus() != PaymentStatus.PAID) {
            throw new CommerceException("Only paid orders can be refunded", HttpStatus.CONFLICT);
        }
        payment.setStatus(PaymentStatus.REFUNDED);
    }

    private Payment getPayment(Order order) {
        return paymentRepository
                .findByOrderId(order.getId())
                .orElseThrow(() -> new CommerceException("Payment not found", HttpStatus.CONFLICT));
    }

    private void validatePayment(Payment payment, Long amount, String paymentLinkId) {
        if (!PAYOS.equals(payment.getPaymentMethod())
                || amount == null
                || toVnd(payment.getAmount()) != amount
                || paymentLinkId == null
                || !paymentLinkId.equals(payment.getExternalTransactionId())) {
            throw new CommerceException("payOS payment does not match the order", HttpStatus.BAD_REQUEST);
        }
    }

    private long toVnd(BigDecimal amount) {
        try {
            return amount.longValueExact();
        } catch (ArithmeticException exception) {
            throw new CommerceException("Payment amount must be a whole VND value", HttpStatus.CONFLICT);
        }
    }
}
