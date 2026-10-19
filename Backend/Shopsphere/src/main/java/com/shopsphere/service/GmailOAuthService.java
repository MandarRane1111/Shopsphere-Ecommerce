
package com.shopsphere.service;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Service
public class GmailOAuthService {

    @Value("${GOOGLE_CLIENT_ID}")
    private String clientId;

    @Value("${GOOGLE_CLIENT_SECRET}")
    private String clientSecret;

    private static final String REDIRECT_URI =
            "http://localhost:8080/oauth2/callback";

    private static final String SCOPE =
            "https://www.googleapis.com/auth/gmail.send";

    private final ConcurrentHashMap<String, Long> pendingStates =
            new ConcurrentHashMap<>();

    public String generateAuthorizationUrl() {

        String state = UUID.randomUUID().toString();
        pendingStates.put(state, System.currentTimeMillis());

        return "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id=" + encode(clientId)
                + "&redirect_uri=" + encode(REDIRECT_URI)
                + "&response_type=code"
                + "&scope=" + encode(SCOPE)
                + "&access_type=offline"
                + "&prompt=consent"
                + "&state=" + encode(state);
    }

    public TokenResponse exchangeAuthorizationCode(
            String code, String state) throws IOException {


Long createdAt = state == null
        ? null
        : pendingStates.remove(state);

if (createdAt == null ||
        System.currentTimeMillis() - createdAt > 300000) {

    throw new IllegalArgumentException(
            "Invalid or expired OAuth state");
}


        return new GoogleAuthorizationCodeTokenRequest(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance(),
                "https://oauth2.googleapis.com/token",
                clientId,
                clientSecret,
                code,
                REDIRECT_URI
        ).execute();
    }

    private String encode(String value) {
        return URLEncoder.encode(
                value, StandardCharsets.UTF_8);
    }
}
