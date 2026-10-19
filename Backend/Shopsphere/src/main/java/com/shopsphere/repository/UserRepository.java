package com.shopsphere.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopsphere.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
	boolean existsByEmail(String email);
	Optional<User> findByEmail(String email);
}
