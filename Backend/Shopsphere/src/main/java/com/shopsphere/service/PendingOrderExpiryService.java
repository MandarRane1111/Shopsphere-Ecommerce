
package com.shopsphere.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopsphere.entity.Order;
import com.shopsphere.repository.OrderItemRepository;
import com.shopsphere.repository.OrderRepository;

@Service
public class PendingOrderExpiryService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public PendingOrderExpiryService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Scheduled(fixedDelay = 30 * 1000L)
    @Transactional
    public void expireUnpaidOnlineOrders() {

        LocalDateTime cutoff = LocalDateTime.now().minusDays(3);

        List<Order> candidates =
                orderRepository
                    .findByPaymentMethodIgnoreCaseAndPaymentStatusIgnoreCaseAndOrderStatusInAndOrderDateBefore(
                        "ONLINE",
                        "PENDING",
                        List.of("PENDING_PAYMENT", "PENDING"),
                        cutoff
                    );

        for (Order candidate : candidates) {

            // Lock and recheck each order before deleting it.
            Order order = orderRepository
                    .findByIdForUpdate(candidate.getId())
                    .orElse(null);

            if (order == null) {
                continue;
            }

            if (!"ONLINE".equalsIgnoreCase(order.getPaymentMethod())) {
                continue;
            }

            if (!"PENDING".equalsIgnoreCase(order.getPaymentStatus())) {
                continue;
            }

            if (!List.of("PENDING_PAYMENT", "PENDING")
                    .contains(order.getOrderStatus())) {
                continue;
            }

            if (order.getOrderDate() == null
                    || !order.getOrderDate().isBefore(cutoff)) {
                continue;
            }

            // Delete dependent rows first to satisfy the foreign key.
            orderItemRepository.deleteByOrderId(order.getId());

            // Delete the expired order from the database.
            orderRepository.delete(order);
        }
    }
}
