package com.example.inventory.service;

import com.example.inventory.model.*;
import com.example.inventory.repository.ReceiptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReceiptService {

    private final ReceiptRepository receiptRepository;

    @Autowired
    public ReceiptService(ReceiptRepository receiptRepository) {
        this.receiptRepository = receiptRepository;
    }

    @Transactional
    public Receipt generateReceipt(Order order, Payment payment) {
        // Check if receipt already exists
        if (receiptRepository.findByOrder(order).isPresent()) {
            throw new RuntimeException("Receipt already exists for this order");
        }

        Receipt receipt = new Receipt(order, payment);
        return receiptRepository.save(receipt);
    }

    public Receipt getReceiptByOrderId(Long orderId) {
        Order order = new Order();
        order.setId(orderId);
        return receiptRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("Receipt not found for order: " + orderId));
    }

    public Receipt getReceiptById(Long receiptId) {
        return receiptRepository.findById(receiptId)
                .orElseThrow(() -> new RuntimeException("Receipt not found: " + receiptId));
    }

    public java.util.List<Receipt> getAllReceipts() {
        return receiptRepository.findAll();
    }
}