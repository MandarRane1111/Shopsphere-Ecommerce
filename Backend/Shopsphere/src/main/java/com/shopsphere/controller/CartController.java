package com.shopsphere.controller;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shopsphere.dto.CartItemResponse;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.User;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.CartService;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    private Long getUserId(Principal principal) {
        if (principal == null) {
            throw new IllegalArgumentException("Authentication required");
        }

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() ->
                    new IllegalArgumentException("User not found"));

        return user.getId();
    }

    // VIEW CART
    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart(Principal principal) {

        List<CartItemResponse> items = cartService
                .getCartItems(getUserId(principal))
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(items);
    }

    // ADD PRODUCT TO CART
    @PostMapping("/add")
    public ResponseEntity<CartItemResponse> addToCart(
            Principal principal,
            @RequestBody AddCartRequest request) {

        CartItem item = cartService.addToCart(
                getUserId(principal),
                request.productId(),
                request.quantity()
        );

        return ResponseEntity.ok(convertToResponse(item));
    }

    // UPDATE QUANTITY
    @PutMapping("/{itemId}")
    public ResponseEntity<CartItemResponse> updateQuantity(
            Principal principal,
            @PathVariable Long itemId,
            @RequestBody UpdateQuantityRequest request) {

        CartItem item = cartService.updateQuantity(
                getUserId(principal),
                itemId,
                request.quantity()
        );

        return ResponseEntity.ok(convertToResponse(item));
    }

    // REMOVE ITEM
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeFromCart(
            Principal principal,
            @PathVariable Long itemId) {

        cartService.removeFromCart(getUserId(principal), itemId);
        return ResponseEntity.noContent().build();
    }

    public record AddCartRequest(Long productId, Integer quantity) {}

    public record UpdateQuantityRequest(Integer quantity) {}
    
    private CartItemResponse convertToResponse(CartItem item) {

        return new CartItemResponse(
            item.getId(),
            item.getProduct().getId(),
            item.getProduct().getName(),
            item.getProduct().getPrice(),
            item.getQuantity(),
            item.getProduct().getImageUrl(),
            item.getProduct().getPrice() * item.getQuantity()
        );
    }
}