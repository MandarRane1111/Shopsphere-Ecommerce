package com.shopsphere.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopsphere.entity.ContactMessage;
import com.shopsphere.repository.ContactMessageRepository;

@Service
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactMessageService(
            ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @Transactional
    public ContactMessage saveMessage(ContactMessage contactMessage) {

        contactMessage.setName(contactMessage.getName().trim());
        contactMessage.setEmail(contactMessage.getEmail().trim());
        contactMessage.setSubject(contactMessage.getSubject().trim());
        contactMessage.setMessage(contactMessage.getMessage().trim());

        return contactMessageRepository.save(contactMessage);
    }
}