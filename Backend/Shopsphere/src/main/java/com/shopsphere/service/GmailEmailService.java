
package com.shopsphere.service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;


import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;

import jakarta.activation.DataHandler;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.util.ByteArrayDataSource;

@Service
public class GmailEmailService {

    @Autowired
    private GmailTokenService gmailTokenService;

    @Autowired
    private InvoiceService invoiceService;

    @Value("${GOOGLE_CLIENT_ID}")
    private String clientId;

    @Value("${GOOGLE_CLIENT_SECRET}")
    private String clientSecret;

    @Value("${shopsphere.gmail.sender}")
    private String senderEmail;

    public void sendOrderConfirmation(
            String recipientEmail,
            Long orderId,
            String emailType) throws Exception {

        byte[] invoicePdf =
                invoiceService.generateInvoice(orderId);

        MimeMessage email = new MimeMessage(
                Session.getInstance(new Properties()));

        email.setFrom(new InternetAddress(senderEmail));
        email.addRecipient(
                jakarta.mail.Message.RecipientType.TO,
                new InternetAddress(recipientEmail));


        String subject;

        switch (emailType) {
            case "COD_PLACED":
                subject = "ShopSphere - Order #" + orderId
                        + " Placed Successfully";
                break;

            case "COD_PAID":
                subject = "ShopSphere - Payment Confirmed for Order #"
                        + orderId;
                break;

            case "ONLINE_PAID":
                subject = "ShopSphere - Order & Payment Confirmed #"
                        + orderId;
                break;

            default:
                throw new IllegalArgumentException(
                        "Invalid email type: " + emailType);
        }

        email.setSubject(subject);


        MimeBodyPart textPart = new MimeBodyPart();

        String emailBody;

        switch (emailType) {

            case "COD_PLACED":
                emailBody =
                        "Thank you for shopping with ShopSphere!\n\n"
                        + "Your Cash on Delivery order #" + orderId
                        + " has been placed successfully.\n\n"
                        + "Payment Method: Cash on Delivery\n"
                        + "Payment Status: PENDING\n\n"
                        + "Please pay the order amount when your "
                        + "product is delivered.\n\n"
                        + "Your invoice is attached.\n\n"
                        + "Regards,\nShopSphere Team";
                break;

            case "COD_PAID":
                emailBody =
                        "Thank you for shopping with ShopSphere!\n\n"
                        + "We have received your Cash on Delivery "
                        + "payment for order #" + orderId + ".\n\n"
                        + "Payment Method: Cash on Delivery\n"
                        + "Payment Status: PAID\n\n"
                        + "Your updated PAID invoice is attached.\n\n"
                        + "Regards,\nShopSphere Team";
                break;

            case "ONLINE_PAID":
                emailBody =
                        "Thank you for shopping with ShopSphere!\n\n"
                        + "Your order #" + orderId
                        + " has been confirmed and your online "
                        + "payment was successful.\n\n"
                        + "Payment Method: Online Payment\n"
                        + "Payment Status: PAID\n\n"
                        + "Your invoice is attached.\n\n"
                        + "Regards,\nShopSphere Team";
                break;

            default:
                throw new IllegalArgumentException(
                        "Invalid email type: " + emailType);
        }

        textPart.setText(
                emailBody,
                StandardCharsets.UTF_8.name());

        MimeBodyPart attachmentPart = new MimeBodyPart();

        attachmentPart.setDataHandler(
                new DataHandler(
                        new ByteArrayDataSource(
                                invoicePdf,
                                "application/pdf")));

        attachmentPart.setFileName(
                "ShopSphere_Invoice_" + orderId + ".pdf");

        MimeMultipart multipart = new MimeMultipart();
        multipart.addBodyPart(textPart);
        multipart.addBodyPart(attachmentPart);

        email.setContent(multipart);
        email.saveChanges();

        ByteArrayOutputStream output =
                new ByteArrayOutputStream();

        email.writeTo(output);

        String encodedEmail = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(output.toByteArray());

        String refreshToken =
                gmailTokenService.getRefreshToken();


UserCredentials credentials =
        UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(refreshToken)
                .build();

credentials.refresh();

HttpCredentialsAdapter credential =
        new HttpCredentialsAdapter(credentials);


        Gmail gmail = new Gmail.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential)
                .setApplicationName("ShopSphere")
                .build();

        Message message = new Message();
        message.setRaw(encodedEmail);

        gmail.users().messages()
                .send("me", message)
                .execute();
    }
}
