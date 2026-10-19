
package com.shopsphere.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shopsphere.entity.Order;
import com.shopsphere.entity.User;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.GmailEmailService;

@RestController
@RequestMapping("/api/admin/gmail-test")
public class GmailTestController {

    @Autowired
    private GmailEmailService gmailEmailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/{orderId}")
    public ResponseEntity<String> sendTestEmail(
            @PathVariable Long orderId,
            Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403)
                    .body("Admin access required");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        if (!"CONFIRMED".equals(order.getOrderStatus())) {
            return ResponseEntity.badRequest()
                    .body("Order is not confirmed");
        }
        
        if (!"ONLINE".equals(order.getPaymentMethod())
                || !"PAID".equals(order.getPaymentStatus())) {

            return ResponseEntity.badRequest()
                    .body("Only successfully paid online orders can use this test");
        }

        try {
        	gmailEmailService.sendOrderConfirmation(
        	        user.getEmail(), orderId, "ONLINE_PAID");

            return ResponseEntity.ok(
                    "Test email sent successfully to "
                    + user.getEmail());


} catch (Exception e) {

    e.printStackTrace();

    return ResponseEntity.internalServerError()
            .body("Gmail sending failed. Check Eclipse Console.");
}

    }
}
