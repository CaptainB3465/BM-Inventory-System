package com.example.inventory.controller;

import com.example.inventory.model.Supplier;
import com.example.inventory.repository.SupplierRepository;
import com.example.inventory.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierRepository supplierRepository;
    private final UserService userService;

    @Autowired
    public SupplierController(SupplierRepository supplierRepository, UserService userService) {
        this.supplierRepository = supplierRepository;
        this.userService = userService;
    }

    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @PostMapping
    public Supplier createSupplier(@RequestBody Supplier supplier) {
        Supplier savedSupplier = supplierRepository.save(supplier);
        
        // Link to a real User account if passcode is provided
        if (supplier.getPasscode() != null && !supplier.getPasscode().isEmpty()) {
            try {
                userService.createUserAccount(
                    savedSupplier.getName(), 
                    savedSupplier.getEmail(), 
                    supplier.getPasscode(), 
                    "SUPPLIER"
                );
            } catch (Exception e) {
                System.err.println("Warning: Failed to create User for Supplier: " + e.getMessage());
            }
        }
        
        return savedSupplier;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Long id) {
        return supplierRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable Long id, @RequestBody Supplier supplierDetails) {
        return supplierRepository.findById(id)
                .map(supplier -> {
                    supplier.setName(supplierDetails.getName());
                    supplier.setCompany(supplierDetails.getCompany());
                    supplier.setEmail(supplierDetails.getEmail());
                    supplier.setPhone(supplierDetails.getPhone());
                    supplier.setAddress(supplierDetails.getAddress());
                    supplier.setStatus(supplierDetails.getStatus());
                    return ResponseEntity.ok(supplierRepository.save(supplier));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        return supplierRepository.findById(id)
                .map(supplier -> {
                    supplierRepository.delete(supplier);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Supplier> searchSuppliers(@RequestParam String name) {
        return supplierRepository.findByNameContainingIgnoreCase(name);
    }
}
