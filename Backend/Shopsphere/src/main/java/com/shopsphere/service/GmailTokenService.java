
package com.shopsphere.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

import org.springframework.stereotype.Service;

@Service
public class GmailTokenService {

    private final Path tokenPath;

    public GmailTokenService() {

        String tokenFile = System.getenv("GMAIL_TOKEN_FILE");

        if (tokenFile == null || tokenFile.isBlank()) {
            tokenFile = System.getProperty("user.home")
                    + "/.shopsphere/gmail-refresh-token.txt";
        }

        tokenPath = Paths.get(tokenFile);
    }

    public void saveRefreshToken(String refreshToken)
            throws IOException {

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException(
                    "Refresh token cannot be empty");
        }

        Path parent = tokenPath.getParent();

        if (parent != null) {
            Files.createDirectories(parent);
        }

        Files.writeString(
                tokenPath,
                refreshToken,
                StandardCharsets.UTF_8,
                StandardOpenOption.CREATE,
                StandardOpenOption.TRUNCATE_EXISTING,
                StandardOpenOption.WRITE
        );
    }

    public String getRefreshToken() throws IOException {

        if (!Files.exists(tokenPath)) {
            throw new IllegalStateException(
                    "Gmail is not authorized yet");
        }

        String refreshToken = Files.readString(
                tokenPath, StandardCharsets.UTF_8).trim();

        if (refreshToken.isBlank()) {
            throw new IllegalStateException(
                    "Saved Gmail refresh token is empty");
        }

        return refreshToken;
    }
}
