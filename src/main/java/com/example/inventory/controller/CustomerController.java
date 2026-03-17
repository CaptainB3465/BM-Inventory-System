package com.example.inventory.controller;

import com.example.inventory.model.Customer;
import com.example.inventory.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final com.example.inventory.service.UserService userService;

    @Autowired
    public CustomerController(CustomerRepository customerRepository, com.example.inventory.service.UserService userService) {
        this.customerRepository = customerRepository;
        this.userService = userService;
    }

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @PostMapping
    public Customer createCustomer(@RequestBody Customer customer) {
        Customer savedCustomer = customerRepository.save(customer);
        
        // Link to a real User account if passcode is provided
        if (customer.getPasscode() != null && !customer.getPasscode().isEmpty()) {
            try {
                userService.createUserAccount(
                    savedCustomer.getName(), 
                    savedCustomer.getEmail(), 
                    customer.getPasscode(), 
                    "CUSTOMER",
                    savedCustomer.getAddress()
                );
            } catch (Exception e) {
                System.err.println("Warning: Failed to create User for Customer: " + e.getMessage());
            }
        }
        
        return savedCustomer;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
        return customerRepository.findById(id)
                .map(customer -> {
                    customer.setName(customerDetails.getName());
                    customer.setEmail(customerDetails.getEmail());
                    customer.setPhone(customerDetails.getPhone());
                    customer.setAddress(customerDetails.getAddress());
                    customer.setStatus(customerDetails.getStatus());
                    customer.setTotalOrders(customerDetails.getTotalOrders());
                    return ResponseEntity.ok(customerRepository.save(customer));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(customer -> {
                    customerRepository.delete(customer);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Customer> searchCustomers(@RequestParam String name) {
        return customerRepository.findByNameContainingIgnoreCase(name);
    }
}
