
package com.shopsphere.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.razorpay.RazorpayException;
import com.shopsphere.entity.Address;
import com.shopsphere.entity.Cart;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.User;
import com.shopsphere.event.OrderEmailEvent;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.CartRepository;
import com.shopsphere.repository.OrderItemRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressService addressService;
    
    @Autowired
    private RazorpayService razorpayService;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Transactional
    public Order placeCodOrder(Long userId, Long addressId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        Address address = addressService.getAddressById(
                userId, addressId);

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart not found"));

        List<CartItem> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        double totalAmount = 0.0;

        // Validate quantities and stock
        for (CartItem item : cartItems) {

            Product product = productRepository.findById(
                    item.getProduct().getId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Product not found"));

            if (item.getQuantity() == null ||
                    item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Invalid quantity");
            }

            if (product.getStock() == null ||
                    product.getStock() < item.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for " + product.getName());
            }

            totalAmount += product.getPrice() * item.getQuantity();
        }

        Order order = new Order();

        order.setUser(user);
        order.setAddress(address);
        order.setTotalAmount(totalAmount);
        order.setOrderStatus("CONFIRMED");
        order.setPaymentMethod("COD");
        order.setPaymentStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        // Save purchased products and update stock
        for (CartItem item : cartItems) {

            Product product = productRepository.findById(
                    item.getProduct().getId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Product not found"));

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(savedOrder);
            orderItem.setProduct(product);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());

            orderItemRepository.save(orderItem);

            product.setStock(
                    product.getStock() - item.getQuantity());

            productRepository.save(product);
        }

        // Clear cart only after order items are saved
     // Clear cart only after order items are saved
        cartItemRepository.deleteAll(cartItems);

        // Schedule COD confirmation email after transaction commit
        eventPublisher.publishEvent(
                new OrderEmailEvent(
                        savedOrder.getId(),
                        user.getEmail(),
                        "COD_PLACED"
                )
        );

        return savedOrder;
        
        
    }
    
    @Transactional
    public Order placeBuyNowCodOrder(
            Long userId,
            Long addressId,
            Long productId,
            Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Invalid quantity");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        Address address = addressService.getAddressById(
                userId, addressId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found"));

        if (product.getStock() == null ||
                product.getStock() < quantity) {
            throw new IllegalArgumentException(
                    "Insufficient stock for " + product.getName());
        }

        double totalAmount = product.getPrice() * quantity;

        Order order = new Order();

        order.setUser(user);
        order.setAddress(address);
        order.setTotalAmount(totalAmount);
        order.setOrderStatus("CONFIRMED");
        order.setPaymentMethod("COD");
        order.setPaymentStatus("PENDING");
        order.setOrderDate(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        OrderItem orderItem = new OrderItem();

        orderItem.setOrder(savedOrder);
        orderItem.setProduct(product);
        orderItem.setQuantity(quantity);
        orderItem.setPrice(product.getPrice());

        orderItemRepository.save(orderItem);

        // Reduce stock for the purchased product.
        product.setStock(product.getStock() - quantity);
        productRepository.save(product);

     // Do NOT delete or modify any cart items.

     // Schedule COD confirmation email after transaction commit
     eventPublisher.publishEvent(
             new OrderEmailEvent(
                     savedOrder.getId(),
                     user.getEmail(),
                     "COD_PLACED"
             )
     );

     return savedOrder;
    }
    

@Transactional
public Order placeOnlineOrder(Long userId, Long addressId) {

    User user = userRepository.findById(userId)
            .orElseThrow(() ->
                    new IllegalArgumentException("User not found"));

    Address address = addressService.getAddressById(
            userId, addressId);

    Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Cart not found"));

    List<CartItem> cartItems =
            cartItemRepository.findByCartId(cart.getId());

    if (cartItems.isEmpty()) {
        throw new IllegalArgumentException("Cart is empty");
    }

    double totalAmount = 0.0;

    for (CartItem item : cartItems) {

        Product product = productRepository.findById(
                item.getProduct().getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found"));

        if (item.getQuantity() == null ||
                item.getQuantity() <= 0) {
            throw new IllegalArgumentException("Invalid quantity");
        }

        if (product.getStock() == null ||
                product.getStock() < item.getQuantity()) {
            throw new IllegalArgumentException(
                    "Insufficient stock for " + product.getName());
        }

        totalAmount += product.getPrice() * item.getQuantity();
    }

    Order order = new Order();

    order.setUser(user);
    order.setAddress(address);
    order.setTotalAmount(totalAmount);
    order.setOrderStatus("PENDING_PAYMENT");
    order.setPaymentMethod("ONLINE");
    order.setCheckoutType("CART");
    order.setPaymentStatus("PENDING");
    order.setOrderDate(LocalDateTime.now());

    Order savedOrder = orderRepository.save(order);

    for (CartItem item : cartItems) {

        Product product = productRepository.findById(
                item.getProduct().getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Product not found"));

        OrderItem orderItem = new OrderItem();

        orderItem.setOrder(savedOrder);
        orderItem.setProduct(product);
        orderItem.setQuantity(item.getQuantity());
        orderItem.setPrice(product.getPrice());

        orderItemRepository.save(orderItem);
    }

    return savedOrder;
}


@Transactional
public Order placeBuyNowOnlineOrder(
        Long userId,
        Long addressId,
        Long productId,
        Integer quantity) {

    if (quantity == null || quantity <= 0) {
        throw new IllegalArgumentException(
                "Quantity must be greater than zero");
    }

    User user = userRepository.findById(userId)
            .orElseThrow(() ->
                    new IllegalArgumentException("User not found"));

    Address address = addressService.getAddressById(
            userId, addressId);

    Product product = productRepository.findById(productId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Product not found"));

    if (product.getStock() == null ||
            product.getStock() < quantity) {
        throw new IllegalArgumentException(
                "Insufficient stock for " + product.getName());
    }

    double totalAmount = product.getPrice() * quantity;

    Order order = new Order();

    order.setUser(user);
    order.setAddress(address);
    order.setTotalAmount(totalAmount);
    order.setOrderStatus("PENDING_PAYMENT");
    order.setPaymentMethod("ONLINE");
    order.setCheckoutType("BUY_NOW");
    order.setPaymentStatus("PENDING");
    order.setOrderDate(LocalDateTime.now());

    Order savedOrder = orderRepository.save(order);

    OrderItem orderItem = new OrderItem();

    orderItem.setOrder(savedOrder);
    orderItem.setProduct(product);
    orderItem.setQuantity(quantity);
    orderItem.setPrice(product.getPrice());

    orderItemRepository.save(orderItem);

    // Do not reduce stock until payment is verified.
    // Do not modify the customer's existing cart.
    return savedOrder;
}

@Transactional
public Order saveOrder(Order order) {
    return orderRepository.save(order);
}

@Transactional
public Order confirmOnlinePayment(
        Long userId,
        Long orderId,
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpaySignature)
        throws RazorpayException {

    Order order = orderRepository.findByIdForUpdate(orderId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Order not found"));

    // Verify order ownership
    if (!order.getUser().getId().equals(userId)) {
        throw new org.springframework.security.access.AccessDeniedException(
                "You cannot access this order");
    }

    if (!"ONLINE".equals(order.getPaymentMethod())) {
        throw new IllegalArgumentException("Not an online order");
    }

    // Only accept the Razorpay order ID stored by our backend
    if (order.getRazorpayOrderId() == null ||
            !order.getRazorpayOrderId().equals(razorpayOrderId)) {
        throw new IllegalArgumentException("Razorpay order ID mismatch");
    }

    // Handle repeated verification safely
    if ("PAID".equals(order.getPaymentStatus())) {
        if (razorpayPaymentId.equals(order.getRazorpayPaymentId())) {
            return order;
        }

        throw new IllegalArgumentException(
                "Order already paid using another payment");
    }

    if (!"PENDING_PAYMENT".equals(order.getOrderStatus()) ||
            !"PENDING".equals(order.getPaymentStatus())) {
        throw new IllegalArgumentException(
                "Order is not awaiting payment");
    }

    if (!"CART".equals(order.getCheckoutType()) &&
            !"BUY_NOW".equals(order.getCheckoutType())) {
        throw new IllegalArgumentException("Invalid checkout type");
    }

    // Verify Razorpay signature
    boolean validSignature = razorpayService.verifyPaymentSignature(
            order.getRazorpayOrderId(),
            razorpayPaymentId,
            razorpaySignature
    );

    if (!validSignature) {
        throw new IllegalArgumentException(
                "Invalid Razorpay payment signature");
    }

    long expectedAmount = java.math.BigDecimal
            .valueOf(order.getTotalAmount())
            .movePointRight(2)
            .longValueExact();

    // Confirm captured payment, amount and currency with Razorpay
    if (!razorpayService.verifyPaymentDetails(
            order.getRazorpayOrderId(),
            razorpayPaymentId,
            expectedAmount)) {
        throw new IllegalArgumentException(
                "Razorpay payment verification failed");
    }


    // Retrieve products purchased in this order
    List<OrderItem> orderItems =
            orderItemRepository.findByOrderId(order.getId());

    if (orderItems.isEmpty()) {
        throw new IllegalArgumentException(
                "No products found in this order");
    }

    // Lock products in a consistent order
    orderItems.sort(
            java.util.Comparator.comparing(
                    item -> item.getProduct().getId()
            )
    );

    // Validate stock before deducting anything
    for (OrderItem item : orderItems) {

        Product product = productRepository.findByIdForUpdate(
                item.getProduct().getId()
        ).orElseThrow(() ->
                new IllegalArgumentException("Product not found"));

        if (item.getQuantity() == null ||
                item.getQuantity() <= 0) {
            throw new IllegalArgumentException("Invalid quantity");
        }

        if (product.getStock() == null ||
                product.getStock() < item.getQuantity()) {
            throw new IllegalArgumentException(
                    "Insufficient stock for " + product.getName());
        }

        product.setStock(
                product.getStock() - item.getQuantity()
        );

        productRepository.save(product);
    }


    // Clear purchased items only for normal cart checkout
    if ("CART".equals(order.getCheckoutType())) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElse(null);

        if (cart != null) {

            List<CartItem> currentCartItems =
                    cartItemRepository.findByCartId(cart.getId());

            for (OrderItem purchasedItem : orderItems) {

                for (CartItem cartItem : currentCartItems) {

                    if (cartItem.getProduct().getId()
                            .equals(purchasedItem.getProduct().getId())) {

                        int remainingQuantity =
                                cartItem.getQuantity()
                                - purchasedItem.getQuantity();

                        if (remainingQuantity <= 0) {
                            cartItemRepository.delete(cartItem);
                        } else {
                            cartItem.setQuantity(remainingQuantity);
                            cartItemRepository.save(cartItem);
                        }

                        break;
                    }
                }
            }
        }
    }

    
 // Record the verified payment
    order.setPaymentStatus("PAID");
    order.setOrderStatus("CONFIRMED");
    order.setRazorpayPaymentId(razorpayPaymentId);
    order.setRazorpaySignature(razorpaySignature);

    Order savedOrder = orderRepository.save(order);

    // Schedule email after successful transaction commit
    eventPublisher.publishEvent(
            new OrderEmailEvent(
                    savedOrder.getId(),
                    savedOrder.getUser().getEmail(),
                    "ONLINE_PAID"
            )
    );

    return savedOrder;

}

@Transactional(readOnly = true)
public List<Order> getOrdersByUserId(Long userId) {

    if (!userRepository.existsById(userId)) {
        throw new IllegalArgumentException(
                "User not found");
    }

    return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
}

@Transactional(readOnly = true)
public Order getOrderById(Long userId, Long orderId) {

    Order order = orderRepository.findById(orderId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Order not found"));

    if (!order.getUser().getId().equals(userId)) {
        throw new org.springframework.security.access.AccessDeniedException(
                "You cannot access this order");
    }

    return order;
}

@Transactional
public Order confirmCodPayment(Long orderId) {

    Order order = orderRepository.findByIdForUpdate(orderId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Order not found"));

    if (!"COD".equals(order.getPaymentMethod())) {
        throw new IllegalArgumentException(
                "Only COD payments can be confirmed here");
    }

    if (!"DELIVERED".equals(order.getOrderStatus())) {
        throw new IllegalArgumentException(
                "Order must be delivered before confirming COD payment");
    }
    
    if (!"DELIVERED".equals(order.getDeliveryStatus())) {
        throw new IllegalArgumentException(
                "COD payment cannot be confirmed before delivery");
    }

    if ("PAID".equals(order.getPaymentStatus())) {
        throw new IllegalArgumentException(
                "COD payment has already been confirmed");
    }

    if (!"PENDING".equals(order.getPaymentStatus())) {
        throw new IllegalArgumentException(
                "Invalid COD payment status");
    }

    order.setPaymentStatus("PAID");
    order.setPaymentConfirmedAt(LocalDateTime.now());

    Order savedOrder = orderRepository.save(order);

    eventPublisher.publishEvent(
            new OrderEmailEvent(
                    savedOrder.getId(),
                    savedOrder.getUser().getEmail(),
                    "COD_PAID"
            )
    );

    return savedOrder;
}

@Transactional
public Order markOrderDelivered(Long orderId) {

    Order order = orderRepository.findByIdForUpdate(orderId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Order not found"));

    if (!"CONFIRMED".equals(order.getOrderStatus())
            && !"SHIPPED".equals(order.getOrderStatus())) {
        throw new IllegalArgumentException(
                "Only confirmed or shipped orders can be marked as delivered");
    }

    if ("DELIVERED".equals(order.getDeliveryStatus())) {
        throw new IllegalArgumentException(
                "Order is already delivered");
    }

    order.setOrderStatus("DELIVERED");
    order.setDeliveryStatus("DELIVERED");

    return orderRepository.save(order);
    
}


@Transactional
public Order updateOrderStatusByAdmin(Long orderId, String status) {

    Order order = orderRepository.findByIdForUpdate(orderId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Order not found"));

    if (status == null || status.trim().isEmpty()) {
        throw new IllegalArgumentException("Status is required");
    }

    String newStatus =
            status.trim().toUpperCase(java.util.Locale.ROOT);

    String currentStatus = order.getOrderStatus();

    String paymentMethod = order.getPaymentMethod();
    String paymentStatus = order.getPaymentStatus();

    if (currentStatus == null) {
        throw new IllegalArgumentException(
                "Current order status is unavailable");
    }

    if (currentStatus.equals(newStatus)) {
        return order;
    }

    // Only allow known order statuses.
    List<String> allowedStatuses = List.of(
            "PENDING",
            "PENDING_PAYMENT",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "OUT_FOR_DELIVERY",
            "DELIVERED",
            "CANCELLED"
    );

    if (!allowedStatuses.contains(newStatus)) {
        throw new IllegalArgumentException(
                "Invalid order status: " + newStatus);
    }

    // Online orders must be paid before fulfilment can proceed.
    boolean isOnlinePayment =
            "ONLINE".equalsIgnoreCase(paymentMethod);

    boolean isPaid =
            "PAID".equalsIgnoreCase(paymentStatus);

    if (isOnlinePayment
            && !isPaid
            && !"CANCELLED".equals(newStatus)) {
        throw new IllegalArgumentException(
                "Online payment must be completed before processing the order");
    }

    // Prevent reopening completed or cancelled orders.
    if ("CANCELLED".equals(currentStatus)) {
        throw new IllegalArgumentException(
                "A cancelled order cannot be updated");
    }

    if ("DELIVERED".equals(currentStatus)) {
        throw new IllegalArgumentException(
                "A delivered order cannot be updated");
    }

    // Validate transitions from the current status.
    boolean validTransition = switch (currentStatus) {

        case "PENDING", "PENDING_PAYMENT" ->
                "CANCELLED".equals(newStatus)
                || (
                    "CONFIRMED".equals(newStatus)
                    && (
                        "COD".equalsIgnoreCase(paymentMethod)
                        || isPaid
                    )
                );

        case "CONFIRMED" ->
                List.of(
                        "PROCESSING",
                        "SHIPPED",
                        "OUT_FOR_DELIVERY",
                        "DELIVERED",
                        "CANCELLED"
                ).contains(newStatus);

        case "PROCESSING" ->
                List.of(
                        "SHIPPED",
                        "OUT_FOR_DELIVERY",
                        "DELIVERED",
                        "CANCELLED"
                ).contains(newStatus);

        case "SHIPPED" ->
                List.of(
                        "OUT_FOR_DELIVERY",
                        "DELIVERED"
                ).contains(newStatus);

        case "OUT_FOR_DELIVERY" ->
                "DELIVERED".equals(newStatus);

        default -> false;
    };

    if (!validTransition) {
        throw new IllegalArgumentException(
                "Cannot change order status from "
                        + currentStatus + " to " + newStatus);
    }

    order.setOrderStatus(newStatus);

    // Keep delivery status aligned with the order's progress.
    switch (newStatus) {

        case "CONFIRMED" ->
                order.setDeliveryStatus("PENDING");

        case "PROCESSING" ->
                order.setDeliveryStatus("PROCESSING");

        case "SHIPPED" ->
                order.setDeliveryStatus("SHIPPED");

        case "OUT_FOR_DELIVERY" ->
                order.setDeliveryStatus("OUT_FOR_DELIVERY");

        case "DELIVERED" ->
                order.setDeliveryStatus("DELIVERED");

        case "CANCELLED" ->
                order.setDeliveryStatus("CANCELLED");

        default -> {
            // No delivery-status update required.
        }
    }

    return orderRepository.save(order);
}

@Transactional
public Order cancelCustomerOrder(Long userId, Long orderId) {

    Order order = orderRepository.findByIdForUpdate(orderId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Order not found"));

    // A customer can cancel only their own order.
    if (!order.getUser().getId().equals(userId)) {
        throw new org.springframework.security.access.AccessDeniedException(
                "You cannot cancel this order");
    }

    String status = order.getOrderStatus();
    String method = order.getPaymentMethod();
    String paymentStatus = order.getPaymentStatus();

    // Allow cancellation of a confirmed COD order before shipping.
    boolean confirmedCod =
            "COD".equalsIgnoreCase(method)
            && "CONFIRMED".equalsIgnoreCase(status);

    // Allow cancellation of an unpaid online order.
    boolean pendingOnline =
            "ONLINE".equalsIgnoreCase(method)
            && "PENDING_PAYMENT".equalsIgnoreCase(status)
            && "PENDING".equalsIgnoreCase(paymentStatus);

    if (!confirmedCod && !pendingOnline) {
        throw new IllegalArgumentException(
                "This order can no longer be cancelled");
    }

    order.setOrderStatus("CANCELLED");
    order.setDeliveryStatus("CANCELLED");

    return orderRepository.save(order);
}
}
