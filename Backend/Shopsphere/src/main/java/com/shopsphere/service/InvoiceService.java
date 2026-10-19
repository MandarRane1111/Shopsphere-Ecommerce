
package com.shopsphere.service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import com.shopsphere.entity.Address;
import com.shopsphere.entity.Order;
import com.shopsphere.entity.OrderItem;
import com.shopsphere.repository.OrderItemRepository;
import com.shopsphere.repository.OrderRepository;

@Service
public class InvoiceService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    public byte[] generateInvoice(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        String orderStatus = order.getOrderStatus();
        String paymentMethod = order.getPaymentMethod();
        String paymentStatus = order.getPaymentStatus();

        // Allow invoice generation for delivered orders.
        boolean isDelivered =
                "DELIVERED".equalsIgnoreCase(orderStatus);

        // Allow invoice generation for confirmed COD orders
        // where payment is still pending.
        boolean isConfirmedCod =
                "CONFIRMED".equalsIgnoreCase(orderStatus)
                && "COD".equalsIgnoreCase(paymentMethod)
                && "PENDING".equalsIgnoreCase(paymentStatus);

        // Allow invoice generation for confirmed online orders
        // where payment has been completed.
        boolean isConfirmedPaidOnline =
                "CONFIRMED".equalsIgnoreCase(orderStatus)
                && "ONLINE".equalsIgnoreCase(paymentMethod)
                && "PAID".equalsIgnoreCase(paymentStatus);

        if (!isDelivered && !isConfirmedCod && !isConfirmedPaidOnline) {
            throw new IllegalArgumentException(
                    "Invoice PDF is available for confirmed eligible orders or delivered orders");
        }

        List<OrderItem> items =
                orderItemRepository.findByOrderId(orderId);

        if (items.isEmpty()) {
            throw new IllegalArgumentException(
                    "Order has no products");
        }

        ByteArrayOutputStream output =
                new ByteArrayOutputStream();

        Document document = new Document();

        try {

            PdfWriter.getInstance(document, output);

            document.open();

            Font titleFont = new Font(
                    Font.HELVETICA, 22, Font.BOLD);

            Font headingFont = new Font(
                    Font.HELVETICA, 12, Font.BOLD);

            Font normalFont = new Font(
                    Font.HELVETICA, 10, Font.NORMAL);

            Paragraph title = new Paragraph(
                    "SHOPSPHERE", titleFont);

            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph(
                    "ORDER INVOICE", headingFont);

            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(25);
            document.add(subtitle);

            DateTimeFormatter formatter =
                    DateTimeFormatter.ofPattern(
                            "dd-MM-yyyy HH:mm");

            document.add(new Paragraph(
                    "Invoice No: INV-" + order.getId(),
                    normalFont));

            document.add(new Paragraph(
                    "Order ID: " + order.getId(),
                    normalFont));

            document.add(new Paragraph(
                    "Order Date: " +
                    order.getOrderDate().format(formatter),
                    normalFont));

            document.add(new Paragraph(
                    "Payment Method: " +
                    order.getPaymentMethod(),
                    normalFont));

            document.add(new Paragraph(
                    "Payment Status: " +
                    order.getPaymentStatus(),
                    normalFont));

            document.add(new Paragraph(" "));

            Address address = order.getAddress();

            document.add(new Paragraph(
                    "BILL TO / DELIVERY ADDRESS",
                    headingFont));

            document.add(new Paragraph(
                    address.getFullName(), normalFont));

            document.add(new Paragraph(
                    address.getAddressLine1(),
                    normalFont));

            if (address.getAddressLine2() != null) {
                document.add(new Paragraph(
                        address.getAddressLine2(),
                        normalFont));
            }

            document.add(new Paragraph(
                    address.getCity() + ", " +
                    address.getState() + " - " +
                    address.getPincode(),
                    normalFont));

            document.add(new Paragraph(
                    "Phone: " + address.getPhone(),
                    normalFont));

            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{4, 1, 2, 2});

            addHeader(table, "Product");
            addHeader(table, "Qty");
            addHeader(table, "Price (INR)");
            addHeader(table, "Total (INR)");

            for (OrderItem item : items) {

                double price = item.getPrice();
                int quantity = item.getQuantity();

                table.addCell(
                        item.getProduct().getName());

                table.addCell(
                        String.valueOf(quantity));

                table.addCell(
                        String.format("%.2f", price));

                table.addCell(
                        String.format("%.2f",
                                price * quantity));
            }

            document.add(table);

            Paragraph total = new Paragraph(
                    String.format(
                            "GRAND TOTAL: INR %.2f",
                            order.getTotalAmount()),
                    headingFont);

            total.setAlignment(Element.ALIGN_RIGHT);
            total.setSpacingBefore(20);

            document.add(total);

            document.add(new Paragraph(" "));

            Paragraph footer = new Paragraph(
                    "Thank you for shopping with ShopSphere!",
                    normalFont);

            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);

            document.add(footer);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate invoice", e);

        } finally {

            if (document.isOpen()) {
                document.close();
            }
        }

        return output.toByteArray();
    }

    private void addHeader(
            PdfPTable table, String text) {

        Font font = new Font(
                Font.HELVETICA, 10, Font.BOLD);

        PdfPCell cell = new PdfPCell(
                new Phrase(text, font));

        cell.setPadding(8);
        table.addCell(cell);
    }
}
