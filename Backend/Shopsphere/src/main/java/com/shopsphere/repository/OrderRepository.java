
package com.shopsphere.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shopsphere.entity.Order;

import jakarta.persistence.LockModeType;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :orderId")
    Optional<Order> findByIdForUpdate(
            @Param("orderId") Long orderId
    );

    List<Order> findByPaymentMethodIgnoreCaseAndPaymentStatusIgnoreCaseAndOrderStatusInAndOrderDateBefore(
            String paymentMethod,
            String paymentStatus,
            List<String> orderStatuses,
            LocalDateTime cutoff
    );

    @Query("""
        SELECT o FROM Order o
        WHERE UPPER(o.orderStatus) <> 'CANCELLED'
        ORDER BY o.orderDate DESC
        """)
    List<Order> findActiveOrders();
}
