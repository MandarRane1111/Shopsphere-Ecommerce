package com.shopsphere.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopsphere.entity.ContactMessage;
import com.shopsphere.service.ContactMessageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contact")
@Validated
public class ContactMessageController {

    private final ContactMessageService contactMessageService;

    public ContactMessageController(
            ContactMessageService contactMessageService) {
        this.contactMessageService = contactMessageService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> submitMessage(
            @Valid @RequestBody ContactMessage contactMessage) {

        contactMessageService.saveMessage(contactMessage);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message",
                        "Your message has been submitted successfully!"
                ));
    }
}