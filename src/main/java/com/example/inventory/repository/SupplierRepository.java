package com.example.inventory.repository;

import com.example.inventory.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByNameContainingIgnoreCase(String name);
    Optional<Supplier> findByEmail(String email);
    boolean existsByEmail(String email);
}
