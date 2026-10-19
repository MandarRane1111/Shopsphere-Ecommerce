
package com.shopsphere.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopsphere.dto.OnlinePaymentResponse;
import com.shopsphere.entity.Cart;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import com.shopsphere.entity.Payment;
import com.shopsphere.entity.Product;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.CartRepository;
import com.shopsphere.repository.OrderItemRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.PaymentRepository;
import com.shopsphere.repository.ProductRepository;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Transactional
    public OnlinePaymentResponse simulatePayment(
            Long userId, Long orderId, boolean success) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }

        if (!"ONLINE".equals(order.getPaymentMethod())) {
            throw new IllegalArgumentException(
                    "This order does not support online payment");
        }

        if (!"PENDING_PAYMENT".equals(order.getOrderStatus())) {
            throw new IllegalArgumentException(
                    "Payment already processed");
        }

        if (paymentRepository.findByOrderId(orderId).isPresent()) {
            throw new IllegalArgumentException(
                    "Payment already recorded");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentMethod("ONLINE");
        payment.setPaymentDate(LocalDateTime.now());

        OnlinePaymentResponse response = new OnlinePaymentResponse();

        response.setOrderId(order.getId());
        response.setAmount(order.getTotalAmount());

        if (success) {

            List<OrderItem> orderItems =
                    orderItemRepository.findByOrderId(orderId);

            if (orderItems.isEmpty()) {
                throw new IllegalArgumentException(
                        "Order has no items");
            }

            // Check stock before completing payment
            for (OrderItem item : orderItems) {

                Product product = productRepository.findById(
                        item.getProduct().getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Product not found"));

                if (product.getStock() < item.getQuantity()) {
                    throw new IllegalArgumentException(
                            "Insufficient stock for " + product.getName());
                }
            }

            // Deduct stock
            for (OrderItem item : orderItems) {

                Product product = productRepository.findById(
                        item.getProduct().getId())
                        .orElseThrow();

                product.setStock(
                        product.getStock() - item.getQuantity());

                productRepository.save(product);
            }

            order.setOrderStatus("CONFIRMED");
            order.setPaymentStatus("PAID");

            payment.setPaymentStatus("SUCCESS");

            String dummyPaymentId =
                    "pay_demo_" + UUID.randomUUID()
                            .toString().replace("-", "")
                            .substring(0, 16);

            payment.setRazorpayPaymentId(dummyPaymentId);

            // Clear only the purchased quantities from the cart
            Cart cart = cartRepository.findByUserId(userId)
                    .orElse(null);

            if (cart != null) {

                List<CartItem> cartItems =
                        cartItemRepository.findByCartId(cart.getId());

                for (CartItem cartItem : cartItems) {

                    for (OrderItem orderItem : orderItems) {

                        if (cartItem.getProduct().getId().equals(
                                orderItem.getProduct().getId())) {

                            int remaining = cartItem.getQuantity()
                                    - orderItem.getQuantity();

                            if (remaining <= 0) {
                                cartItemRepository.delete(cartItem);
                            } else {
                                cartItem.setQuantity(remaining);
                                cartItemRepository.save(cartItem);
                            }

                            break;
                        }
                    }
                }
            }

            response.setPaymentId(dummyPaymentId);
            response.setMessage("Dummy payment successful. Order confirmed.");

        } else {

            order.setOrderStatus("PAYMENT_FAILED");
            order.setPaymentStatus("FAILED");

            payment.setPaymentStatus("FAILED");

            response.setMessage(
                    "Dummy payment failed. No money was charged.");
        }

        orderRepository.save(order);
        paymentRepository.save(payment);

        response.setOrderStatus(order.getOrderStatus());
        response.setPaymentStatus(order.getPaymentStatus());

        return response;
    }
}
