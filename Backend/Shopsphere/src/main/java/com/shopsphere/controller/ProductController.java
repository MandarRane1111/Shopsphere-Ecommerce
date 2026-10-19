package com.shopsphere.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.shopsphere.entity.Product;
import com.shopsphere.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // ADD PRODUCT - ADMIN ONLY
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.addProduct(product));
    }

    // GET ALL PRODUCTS
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
    

    // SEARCH AND FILTER PRODUCTS
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId) {

        return ResponseEntity.ok(
                productService.searchProducts(name, categoryId)
        );
    }


    // GET PRODUCT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    // UPDATE PRODUCT - ADMIN ONLY
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {

        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    // DELETE PRODUCT - ADMIN ONLY
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}