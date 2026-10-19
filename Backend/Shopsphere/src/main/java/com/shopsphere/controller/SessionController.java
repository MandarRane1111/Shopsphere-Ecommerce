package com.shopsphere.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/session")
public class SessionController {

    @PostMapping("/activity")
    public ResponseEntity<Void> recordActivity(
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null ||
            session.getAttribute("userEmail") == null) {

            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        response.setHeader(
            HttpHeaders.SET_COOKIE,
            "JSESSIONID=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
        );

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .build();
    }
}