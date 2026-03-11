package com.example.inventory.service;

import com.example.inventory.model.*;
import com.example.inventory.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final ReceiptService receiptService;

    @Autowired
    public OrderService(OrderRepository orderRepository, 
                        ProductRepository productRepository, 
                        UserRepository userRepository,
                        PaymentRepository paymentRepository,
                        ReceiptService receiptService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.receiptService = receiptService;
    }

    @Transactional
    public Order createOrder(String email, List<OrderItemRequest> itemRequests) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        double totalAmount = 0;
        Order order = new Order(user, 0.0);
        order = orderRepository.save(order);

        for (OrderItemRequest request : itemRequests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + request.getProductId()));

            if (product.getQuantity() < request.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Update stock
            product.setQuantity(product.getQuantity() - request.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem(order, product, request.getQuantity(), product.getPrice());
            order.getItems().add(orderItem);
            totalAmount += product.getPrice() * request.getQuantity();
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        // Create initial pending payment
        Payment payment = new Payment(order, totalAmount, "Credit Card");
        payment.setTransactionId(UUID.randomUUID().toString());
        paymentRepository.save(payment);

        return order;
    }

    @Transactional
    public Order approvePayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be approved");
        }

        order.setStatus(OrderStatus.PAID);
        
        Payment payment = paymentRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("Payment record not found"));
        payment.setStatus(PaymentStatus.COMPLETED);
        
        paymentRepository.save(payment);
        orderRepository.save(order);

        // Generate receipt after successful payment
        receiptService.generateReceipt(order, payment);
        
        return order;
    }

    @Transactional
    public Order shipOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Orders must be PAID before shipping");
        }

        order.setStatus(OrderStatus.SHIPPED);
        return orderRepository.save(order);
    }

    @Transactional
    public Order deliverOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new RuntimeException("Orders must be SHIPPED before delivery");
        }

        order.setStatus(OrderStatus.DELIVERED);
        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByUsername(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUser(user);
    }

    // Inner class for requests
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
