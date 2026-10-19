
package com.shopsphere.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopsphere.entity.Address;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserId(Long userId);
}
