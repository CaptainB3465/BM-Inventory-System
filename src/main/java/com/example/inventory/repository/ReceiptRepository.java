package com.example.inventory.repository;

import com.example.inventory.model.Receipt;
import com.example.inventory.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    Optional<Receipt> findByOrder(Order order);
}