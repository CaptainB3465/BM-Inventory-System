package com.example.inventory.controller;

import com.example.inventory.model.Receipt;
import com.example.inventory.model.OrderItem;
import com.example.inventory.service.ReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    @Autowired
    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @GetMapping
    public ResponseEntity<java.util.List<Receipt>> getAllReceipts() {
        try {
            java.util.List<Receipt> receipts = receiptService.getAllReceipts();
            return ResponseEntity.ok(receipts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{receiptId}")
    public ResponseEntity<Receipt> getReceipt(@PathVariable Long receiptId) {
        try {
            Receipt receipt = receiptService.getReceiptById(receiptId);
            return ResponseEntity.ok(receipt);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{receiptId}/print")
    public ResponseEntity<String> getReceiptForPrinting(@PathVariable Long receiptId) {
        try {
            Receipt receipt = receiptService.getReceiptById(receiptId);

            // Load the HTML template
            ClassPathResource resource = new ClassPathResource("static/receipt-template.html");
            String template = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);

            // Prepare data for template
            Map<String, String> data = new HashMap<>();
            data.put("receiptNumber", receipt.getReceiptNumber());
            data.put("generatedAt", receipt.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            data.put("customerName", receipt.getOrder().getUser().getEmail());
            data.put("orderId", receipt.getOrder().getId().toString());
            data.put("totalAmount", String.format("%.2f", receipt.getOrder().getTotalAmount()));
            data.put("paymentMethod", receipt.getPayment().getPaymentMethod());
            data.put("transactionId", receipt.getPayment().getTransactionId());
            data.put("paymentStatus", receipt.getPayment().getStatus().toString());

            // Build items HTML
            StringBuilder itemsHtml = new StringBuilder();
            for (OrderItem item : receipt.getOrder().getItems()) {
                itemsHtml.append(String.format(
                    "<tr><td>%s</td><td>%d</td><td>$%.2f</td><td>$%.2f</td></tr>",
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getPriceAtOrder(),
                    item.getQuantity() * item.getPriceAtOrder()
                ));
            }

            // Replace template variables
            String html = template;
            for (Map.Entry<String, String> entry : data.entrySet()) {
                html = html.replace("{{" + entry.getKey() + "}}", entry.getValue());
            }
            html = html.replace("{{#items}}", "").replace("{{/items}}", itemsHtml.toString());

            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(html);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}