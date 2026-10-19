package com.shopsphere.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopsphere.entity.ContactMessage;

public interface ContactMessageRepository
        extends JpaRepository<ContactMessage, Long> {

}