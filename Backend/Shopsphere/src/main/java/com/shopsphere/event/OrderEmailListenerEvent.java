package com.shopsphere.event;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.shopsphere.service.GmailEmailService;

@Component
public class OrderEmailListenerEvent {

    @Autowired
    private GmailEmailService gmailEmailService;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderEmail(OrderEmailEvent event) {

        try {
            gmailEmailService.sendOrderConfirmation(
                    event.getRecipientEmail(),
                    event.getOrderId(),
                    event.getEmailType()
            );

            System.out.println(
                    "ShopSphere email sent successfully for order #"
                    + event.getOrderId());

        } catch (Exception e) {

            System.err.println(
                    "ShopSphere email failed for order #"
                    + event.getOrderId());

            e.printStackTrace();
        }
    }
}