package com.shopsphere.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.shopsphere.entity.User;
import com.shopsphere.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email Already Registered");
        }

        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Assign CUSTOMER role by default
        user.setRole("CUSTOMER");

        // Save user and return the saved object
        return userRepository.save(user);
    }
}