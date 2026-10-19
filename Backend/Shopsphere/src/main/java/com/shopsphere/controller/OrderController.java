
package com.shopsphere.controller;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.razorpay.RazorpayException;
import com.shopsphere.dto.BuyNowRequest;
import com.shopsphere.dto.OnlinePaymentRequest;
import com.shopsphere.dto.OrderResponse;
import com.shopsphere.dto.PlaceOrderRequest;
import com.shopsphere.dto.RazorpayOrderResponse;
import com.shopsphere.dto.RazorpayVerifyRequest;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.User;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.OrderService;
import com.shopsphere.service.RazorpayService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private RazorpayService razorpayService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Autowired
    private UserRepository userRepository;

    private Long getUserId(Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        return user.getId();
    }

    private OrderResponse toResponse(Order order) {

        OrderResponse response = new OrderResponse();

        response.setOrderId(order.getId());
        response.setTotalAmount(order.getTotalAmount());
        response.setOrderStatus(order.getOrderStatus());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setOrderDate(order.getOrderDate());

        return response;
    }

    @PostMapping("/cod")
    public ResponseEntity<OrderResponse> placeCodOrder(
            Principal principal,
            @RequestBody PlaceOrderRequest request) {

        if (request.getAddressId() == null) {
            throw new IllegalArgumentException(
                    "Delivery address is required");
        }

        Order order = orderService.placeCodOrder(
                getUserId(principal),
                request.getAddressId());

        return ResponseEntity.ok(toResponse(order));
    }
    
    @PostMapping("/buy-now/cod")
    public ResponseEntity<OrderResponse> placeBuyNowCodOrder(
            Principal principal,
            @RequestBody BuyNowRequest request) {

        if (request.getAddressId() == null) {
            throw new IllegalArgumentException(
                    "Delivery address is required");
        }

        if (request.getProductId() == null) {
            throw new IllegalArgumentException(
                    "Product is required");
        }

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }

        Order order = orderService.placeBuyNowCodOrder(
                getUserId(principal),
                request.getAddressId(),
                request.getProductId(),
                request.getQuantity());

        return ResponseEntity.ok(toResponse(order));
    }
    


@PostMapping("/online")
public ResponseEntity<RazorpayOrderResponse> placeOnlineOrder(
        Principal principal,
        @RequestBody OnlinePaymentRequest request)
        throws RazorpayException {

    if (request.getAddressId() == null) {
        throw new IllegalArgumentException(
                "Delivery address is required");
    }

    if (request.getProductId() == null
            && request.getQuantity() != null) {
        throw new IllegalArgumentException(
                "Product is required for Buy Now");
    }

    Long userId = getUserId(principal);

    // Create a pending ShopSphere order
    Order order;

    if (request.getProductId() != null) {

        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "Invalid Buy Now quantity");
        }

        order = orderService.placeBuyNowOnlineOrder(
                userId,
                request.getAddressId(),
                request.getProductId(),
                request.getQuantity());

    } else {

        order = orderService.placeOnlineOrder(
                userId,
                request.getAddressId());
    }

    // Convert MySQL order total from rupees to paise
    long amountInPaise = java.math.BigDecimal
            .valueOf(order.getTotalAmount())
            .movePointRight(2)
            .longValueExact();

    String receipt = "SS-" + order.getId();

    // Create Razorpay payment order
    com.razorpay.Order razorpayOrder =
            razorpayService.createRazorpayOrder(
                    amountInPaise,
                    receipt);

    String razorpayOrderId =
            razorpayOrder.get("id");

    // Save Razorpay Order ID in MySQL
    order.setRazorpayOrderId(razorpayOrderId);

    orderService.saveOrder(order);

    return ResponseEntity.ok(
            new RazorpayOrderResponse(
                    order.getId(),
                    razorpayOrderId,
                    razorpayKeyId,
                    amountInPaise,
                    "INR"
            )
    );
}


@PostMapping("/verify-payment")
public ResponseEntity<OrderResponse> verifyOnlinePayment(
        Principal principal,
        @RequestBody RazorpayVerifyRequest request)
        throws RazorpayException {

    if (request.getOrderId() == null) {
        throw new IllegalArgumentException(
                "ShopSphere order ID is required");
    }

    if (request.getRazorpayOrderId() == null ||
            request.getRazorpayPaymentId() == null ||
            request.getRazorpaySignature() == null) {
        throw new IllegalArgumentException(
                "Razorpay payment details are required");
    }

    Long userId = getUserId(principal);

    Order order = orderService.confirmOnlinePayment(
            userId,
            request.getOrderId(),
            request.getRazorpayOrderId(),
            request.getRazorpayPaymentId(),
            request.getRazorpaySignature()
    );

    return ResponseEntity.ok(toResponse(order));
}


@GetMapping("/my")
public ResponseEntity<List<OrderResponse>> getMyOrders(
        Principal principal) {

    Long userId = getUserId(principal);

    List<OrderResponse> orders = orderService
            .getOrdersByUserId(userId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());

    return ResponseEntity.ok(orders);
}

@GetMapping("/{orderId}")
public ResponseEntity<OrderResponse> getOrderById(
        Principal principal,
        @PathVariable Long orderId) {

    Long userId = getUserId(principal);

    Order order = orderService.getOrderById(
            userId, orderId);

    return ResponseEntity.ok(toResponse(order));
}

@PutMapping("/{orderId}/cancel")
public ResponseEntity<?> cancelMyOrder(
        Principal principal,
        @PathVariable Long orderId) {

    try {
        Long userId = getUserId(principal);

        Order cancelledOrder =
                orderService.cancelCustomerOrder(userId, orderId);

        return ResponseEntity.ok(toResponse(cancelledOrder));

    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}


}
