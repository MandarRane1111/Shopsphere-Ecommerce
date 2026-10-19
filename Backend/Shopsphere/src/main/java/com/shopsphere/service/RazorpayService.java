
package com.shopsphere.service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

@Service
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public com.razorpay.Order createRazorpayOrder(
            long amountInPaise,
            String receipt) throws RazorpayException {

        RazorpayClient razorpayClient =
                new RazorpayClient(keyId, keySecret);

        JSONObject options = new JSONObject();

        options.put("amount", amountInPaise);
        options.put("currency", "INR");
        options.put("receipt", receipt);

        return razorpayClient.orders.create(options);
    }
    

public boolean verifyPaymentSignature(
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpaySignature) {

    if (razorpayOrderId == null ||
            razorpayPaymentId == null ||
            razorpaySignature == null) {
        return false;
    }

    try {
        JSONObject attributes = new JSONObject();

        attributes.put(
                "razorpay_order_id",
                razorpayOrderId
        );

        attributes.put(
                "razorpay_payment_id",
                razorpayPaymentId
        );

        attributes.put(
                "razorpay_signature",
                razorpaySignature
        );

        return com.razorpay.Utils.verifyPaymentSignature(
                attributes,
                keySecret
        );

    } catch (Exception e) {
        return false;
    }
}


public boolean verifyPaymentDetails(
        String razorpayOrderId,
        String razorpayPaymentId,
        long expectedAmountInPaise)
        throws RazorpayException {

    RazorpayClient razorpayClient =
            new RazorpayClient(keyId, keySecret);

    // Fetch payment details directly from Razorpay
    com.razorpay.Payment payment =
            razorpayClient.payments.fetch(
                    razorpayPaymentId
            );

    String actualOrderId = payment.get("order_id");
    String paymentStatus = payment.get("status");
    String currency = payment.get("currency");

    Number amount = payment.get("amount");

    return razorpayOrderId.equals(actualOrderId)
            && "captured".equals(paymentStatus)
            && "INR".equals(currency)
            && amount != null
            && amount.longValue() == expectedAmountInPaise;
}


}
