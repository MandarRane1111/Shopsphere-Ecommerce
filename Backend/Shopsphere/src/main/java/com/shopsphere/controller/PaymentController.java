
package com.shopsphere.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shopsphere.dto.OnlinePaymentResponse;
import com.shopsphere.entity.User;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    private Long getUserId(Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        return user.getId();
    }

    @PostMapping("/{orderId}/success")
    public ResponseEntity<OnlinePaymentResponse> paymentSuccess(
            Principal principal,
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                paymentService.simulatePayment(
                        getUserId(principal), orderId, true));
    }

    @PostMapping("/{orderId}/failure")
    public ResponseEntity<OnlinePaymentResponse> paymentFailure(
            Principal principal,
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                paymentService.simulatePayment(
                        getUserId(principal), orderId, false));
    }
}
