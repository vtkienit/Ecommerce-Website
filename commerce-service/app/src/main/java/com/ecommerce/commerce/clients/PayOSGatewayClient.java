package com.ecommerce.commerce.clients;

import com.ecommerce.commerce.exceptions.CommerceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.webhooks.WebhookData;

@Component
public class PayOSGatewayClient implements PayOSGateway {

    private final PayOS payOS;

    public PayOSGatewayClient(
            @Value("${payment.payos.client-id}") String clientId,
            @Value("${payment.payos.api-key}") String apiKey,
            @Value("${payment.payos.checksum-key}") String checksumKey
    ) {
        this.payOS = new PayOS(clientId, apiKey, checksumKey);
    }

    @Override
    public CreatePaymentLinkResponse createPaymentLink(CreatePaymentLinkRequest request) {
        try {
            return payOS.paymentRequests().create(request);
        } catch (RuntimeException exception) {
            throw new CommerceException("Unable to create the payOS payment link", HttpStatus.BAD_GATEWAY);
        }
    }

    @Override
    public WebhookData verifyWebhook(Object payload) {
        try {
            return payOS.webhooks().verify(payload);
        } catch (RuntimeException exception) {
            throw new CommerceException("Invalid payOS webhook signature", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public PaymentLink getPaymentLink(Long orderCode) {
        try {
            return payOS.paymentRequests().get(orderCode);
        } catch (RuntimeException exception) {
            throw new CommerceException("Unable to verify the payOS payment", HttpStatus.BAD_GATEWAY);
        }
    }

    @Override
    public void cancelPaymentLink(Long orderCode) {
        try {
            payOS.paymentRequests().cancel(orderCode, "Order cancelled by customer or administrator");
        } catch (RuntimeException exception) {
            throw new CommerceException("Unable to cancel the payOS payment link", HttpStatus.BAD_GATEWAY);
        }
    }
}
