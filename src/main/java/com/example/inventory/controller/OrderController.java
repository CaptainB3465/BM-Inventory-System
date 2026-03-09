package com.example.inventory.controller;

import com.example.inventory.model.Order;
import com.example.inventory.model.Receipt;
import com.example.inventory.service.OrderService;
import com.example.inventory.service.ReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final ReceiptService receiptService;

    @Autowired
    public OrderController(OrderService orderService, ReceiptService receiptService) {
        this.orderService = orderService;
        this.receiptService = receiptService;
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestParam String username, @RequestBody List<OrderService.OrderItemRequest> items) {
        try {
            Order order = orderService.createOrder(username, items);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public List<Order> getAllOrders(@RequestParam(required = false) String username) {
        if (username != null) {
            return orderService.getOrdersByUsername(username);
        }
        return orderService.getAllOrders();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Order> approvePayment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.approvePayment(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/ship")
    public ResponseEntity<Order> shipOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.shipOrder(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/deliver")
    public ResponseEntity<Order> deliverOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.deliverOrder(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{orderId}/receipt")
    public ResponseEntity<Receipt> getReceipt(@PathVariable Long orderId) {
        try {
            Receipt receipt = receiptService.getReceiptByOrderId(orderId);
            return ResponseEntity.ok(receipt);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/receipt/{receiptId}")
    public ResponseEntity<Receipt> getReceiptById(@PathVariable Long receiptId) {
        try {
            Receipt receipt = receiptService.getReceiptById(receiptId);
            return ResponseEntity.ok(receipt);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
