
package com.shopsphere.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.api.client.auth.oauth2.TokenResponse;
import com.shopsphere.service.GmailOAuthService;
import com.shopsphere.service.GmailTokenService;

@RestController
public class GmailOAuthController {

    @Autowired
    private GmailOAuthService gmailOAuthService;
    
    @Autowired
    private GmailTokenService gmailTokenService;

    @GetMapping("/oauth2/callback")
    public ResponseEntity<String> callback(
            @RequestParam String code,
            @RequestParam String state) {

        try {

            TokenResponse token =
                    gmailOAuthService.exchangeAuthorizationCode(
                            code, state);

            if (token.getRefreshToken() == null) {
                return ResponseEntity.status(
                        HttpStatus.BAD_REQUEST)
                        .body("Google did not return a refresh token.");
            }

gmailTokenService.saveRefreshToken(
        token.getRefreshToken());


            // Never return OAuth tokens to the browser.
            // Secure token storage will be implemented next.
            return ResponseEntity.ok(
                    "Gmail authorization successful. "
                    + "Refresh token received.");

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body("Invalid OAuth authorization request.");

        } catch (IOException e) {

            return ResponseEntity.status(
                    HttpStatus.BAD_GATEWAY)
                    .body("Google OAuth authorization failed.");
        }
    }
}
