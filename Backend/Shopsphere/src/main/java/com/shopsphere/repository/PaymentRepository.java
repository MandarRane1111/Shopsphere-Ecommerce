
package com.shopsphere.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopsphere.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);
}
