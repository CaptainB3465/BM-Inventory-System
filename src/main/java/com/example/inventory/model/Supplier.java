package com.example.inventory.model;

import jakarta.persistence.*;

/**
 * Supplier entity — represents a product supplier.
 * When created by admin, a linked User account is also created
 * so the supplier can log in with role SUPPLIER.
 */
@Entity
@Table(name = "suppliers")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String company;
    private String email;
    private String phone;
    private String address;
    private String status; // "Active" | "Inactive"

    // Passcode is used only during creation to create a linked User account.
    // It is NOT persisted in this table — it lives in the users table.
    @Transient
    private String passcode;

    public Supplier() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPasscode() { return passcode; }
    public void setPasscode(String passcode) { this.passcode = passcode; }
}
