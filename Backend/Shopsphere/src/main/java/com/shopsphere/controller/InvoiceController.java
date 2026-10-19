
package com.shopsphere.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shopsphere.entity.Order;
import com.shopsphere.entity.User;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.InvoiceService;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{orderId}")
    public ResponseEntity<byte[]> downloadInvoice(
            Principal principal,
            @PathVariable Long orderId) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        // Only the customer who placed the order can download it
     // Only the customer who placed the order can download the invoice.
        if (!order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        // Customer downloads remain restricted to delivered orders.
        if (!"DELIVERED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new IllegalArgumentException(
                    "Invoice is available only for delivered orders"
            );
        }

        byte[] pdf = invoiceService.generateInvoice(orderId);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=ShopSphere_Invoice_"
                                + orderId + ".pdf"
                )
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length)
                .body(pdf);
    }
}
