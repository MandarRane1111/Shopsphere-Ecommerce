
package com.shopsphere.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shopsphere.entity.Order;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.service.OrderService;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findActiveOrders());
    }
    

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {

        try {
            Order updatedOrder =
                    orderService.updateOrderStatusByAdmin(orderId, status);

            return ResponseEntity.ok(
                    "Order status updated to "
                            + updatedOrder.getOrderStatus()
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{orderId}/confirm-cod-payment")
    public ResponseEntity<?> confirmCodPayment(@PathVariable Long orderId) {

        try {
            Order order = orderService.confirmCodPayment(orderId);

            return ResponseEntity.ok(
                    "COD payment confirmed successfully for order #"
                            + order.getId()
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
