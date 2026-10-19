
package com.shopsphere.dto;

public class RazorpayOrderResponse {

    private Long orderId;
    private String razorpayOrderId;
    private String keyId;
    private Long amount;
    private String currency;

    public RazorpayOrderResponse(
            Long orderId,
            String razorpayOrderId,
            String keyId,
            Long amount,
            String currency) {

        this.orderId = orderId;
        this.razorpayOrderId = razorpayOrderId;
        this.keyId = keyId;
        this.amount = amount;
        this.currency = currency;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public String getKeyId() {
        return keyId;
    }

    public Long getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }
}
