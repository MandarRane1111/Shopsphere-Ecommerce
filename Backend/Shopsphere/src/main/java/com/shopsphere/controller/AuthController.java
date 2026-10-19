
package com.shopsphere.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.shopsphere.dto.AuthResponse;
import com.shopsphere.dto.LoginRequest;
import com.shopsphere.dto.RegisterRequest;
import com.shopsphere.entity.User;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.JwtService;
import com.shopsphere.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    // REGISTER USER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setPhone(request.getPhone());

        User savedUser = userService.registerUser(user);

        String token = jwtService.generateToken(savedUser.getEmail());

        AuthResponse response = new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );

        return ResponseEntity.ok(response);
    }

    // LOGIN USER
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        // Preserve existing session behavior.
        HttpSession existingSession = httpRequest.getSession(false);

        if (existingSession != null) {
            existingSession.invalidate();
        }

        // CUSTOMER session expires after 3 minutes of inactivity.
        if ("CUSTOMER".equals(user.getRole())) {
            HttpSession session = httpRequest.getSession(true);
            session.setMaxInactiveInterval(180);
            session.setAttribute("userEmail", user.getEmail());
        }

        String token = jwtService.generateToken(user.getEmail());

        AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );

        return ResponseEntity.ok(response);
    }

    // GET LOGGED-IN USER PROFILE
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        Map<String, Object> profile = new LinkedHashMap<>();

        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone());
        profile.put("role", user.getRole());

        return ResponseEntity.ok(profile);
    }

    // UPDATE LOGGED-IN USER PROFILE
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> profileData,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        String currentEmail = authentication.getName();

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        // Update only fields supplied by the frontend.
        // Password and role cannot be changed here.
        if (profileData.containsKey("name")) {
            user.setName(profileData.get("name"));
        }

        if (profileData.containsKey("email")) {
            String newEmail = profileData.get("email");

            if (!currentEmail.equals(newEmail)
                    && userRepository.existsByEmail(newEmail)) {
                throw new IllegalArgumentException(
                        "Email already registered"
                );
            }

            user.setEmail(newEmail);
        }

        if (profileData.containsKey("phone")) {
            user.setPhone(profileData.get("phone"));
        }

        User updatedUser = userRepository.save(user);

        // Keep the CUSTOMER HTTP session synchronized with the new email.
        if ("CUSTOMER".equals(updatedUser.getRole())) {
            HttpSession session = httpRequest.getSession(false);

            if (session != null) {
                session.setAttribute(
                        "userEmail",
                        updatedUser.getEmail()
                );
            }
        }

        /*
         * IMPORTANT:
         * Refresh the SecurityContext principal after an email change.
         * Otherwise, the session may retain the previous email and
         * subsequent profile/cart requests can look up a nonexistent user.
         */
        UsernamePasswordAuthenticationToken updatedAuthentication =
                new UsernamePasswordAuthenticationToken(
                        updatedUser.getEmail(),
                        null,
                        authentication.getAuthorities()
                );

        SecurityContextHolder.getContext()
                .setAuthentication(updatedAuthentication);

        // Generate a JWT for the updated email.
        String updatedToken =
                jwtService.generateToken(updatedUser.getEmail());

        Map<String, Object> profile = new LinkedHashMap<>();

        profile.put("id", updatedUser.getId());
        profile.put("name", updatedUser.getName());
        profile.put("email", updatedUser.getEmail());
        profile.put("phone", updatedUser.getPhone());
        profile.put("role", updatedUser.getRole());
        profile.put("token", updatedToken);

        return ResponseEntity.ok(profile);
    }
}
