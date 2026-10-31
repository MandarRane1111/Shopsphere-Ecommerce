
package com.shopsphere.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.shopsphere.service.GmailOAuthService;

@Component
@ConditionalOnProperty(
        name = "shopsphere.gmail.setup",
        havingValue = "true"
)
public class GmailSetupRunner implements CommandLineRunner {

    @Autowired
    private GmailOAuthService gmailOAuthService;

    @Override
    public void run(String... args) {
        System.out.println(">>> GmailSetupRunner started");

        String authorizationUrl =
                gmailOAuthService.generateAuthorizationUrl();

        System.out.println("Gmail OAuth setup URL: " + authorizationUrl);
    }
}
