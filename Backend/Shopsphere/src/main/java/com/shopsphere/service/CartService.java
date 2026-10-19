package com.shopsphere.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopsphere.entity.Cart;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.User;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.CartRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Cart getOrCreateCart(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    @Transactional
    public CartItem addToCart(Long userId, Long productId, Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    return newItem;
                });

        int newQuantity = item.getQuantity() + quantity;

        if (newQuantity > product.getStock()) {
            throw new IllegalArgumentException("Insufficient product stock");
        }

        item.setQuantity(newQuantity);

        return cartItemRepository.save(item);
    }

    public List<CartItem> getCartItems(Long userId) {

        Cart cart = getOrCreateCart(userId);

        return cartItemRepository.findByCartId(cart.getId());
    }

    @Transactional
    public CartItem updateQuantity(Long userId, Long itemId, Integer quantity) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to this user");
        }

        if (quantity > item.getProduct().getStock()) {
            throw new IllegalArgumentException("Insufficient product stock");
        }

        item.setQuantity(quantity);

        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeFromCart(Long userId, Long itemId) {

        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to this user");
        }

        cartItemRepository.delete(item);
    }
}