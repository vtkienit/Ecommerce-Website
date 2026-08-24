package com.ecommerce.commerce.clients;

import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLink;
import vn.payos.model.webhooks.WebhookData;

public interface PayOSGateway {

    CreatePaymentLinkResponse createPaymentLink(CreatePaymentLinkRequest request);

    WebhookData verifyWebhook(Object payload);

    PaymentLink getPaymentLink(Long orderCode);

    void cancelPaymentLink(Long orderCode);
}
