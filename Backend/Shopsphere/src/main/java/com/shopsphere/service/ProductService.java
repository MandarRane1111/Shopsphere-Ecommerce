package com.shopsphere.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shopsphere.entity.Product;
import com.shopsphere.entity.Category;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.CategoryRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Product addProduct(Product product) {
        Long categoryId = product.getCategory().getId();

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        product.setCategory(category);
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    

    // SEARCH AND FILTER PRODUCTS
    public List<Product> searchProducts(String name, Long categoryId) {

        boolean hasName = name != null && !name.isBlank();

        if (hasName && categoryId != null) {
            return productRepository
                    .findByCategoryIdAndNameContainingIgnoreCase(
                            categoryId, name.trim());
        }

        if (hasName) {
            return productRepository
                    .findByNameContainingIgnoreCase(name.trim());
        }

        if (categoryId != null) {
            return productRepository.findByCategoryId(categoryId);
        }

        return productRepository.findAll();
    }


    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    public Product updateProduct(Long id, Product product) {
        Product existing = getProductById(id);

        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setStock(product.getStock());
        existing.setImageUrl(product.getImageUrl());
        existing.setBrand(product.getBrand());

        if (product.getCategory() != null) {
            Category category = categoryRepository.findById(product.getCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            existing.setCategory(category);
        }

        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        Product existing = getProductById(id);
        productRepository.delete(existing);
    }
}