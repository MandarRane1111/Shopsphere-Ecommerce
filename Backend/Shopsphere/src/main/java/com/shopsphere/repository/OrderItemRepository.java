
package com.shopsphere.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shopsphere.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Modifying
    @Query("DELETE FROM OrderItem oi WHERE oi.order.id = :orderId")
    int deleteByOrderId(@Param("orderId") Long orderId);
}
