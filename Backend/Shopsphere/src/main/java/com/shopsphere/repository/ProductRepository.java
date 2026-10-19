
package com.shopsphere.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shopsphere.entity.Product;

import jakarta.persistence.LockModeType;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Search products by name (case-insensitive)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Filter products by category
    List<Product> findByCategoryId(Long categoryId);

    // Search products within a category
    List<Product> findByCategoryIdAndNameContainingIgnoreCase(
            Long categoryId, String name);
    

@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Product p WHERE p.id = :productId")
Optional<Product> findByIdForUpdate(
        @Param("productId") Long productId
);

}
