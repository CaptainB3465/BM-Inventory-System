package com.example.inventory.model;

public class LoginResponse {
    private String email;
    private String fullName;
    private String role;
    private String status;

    public LoginResponse(String email, String fullName, String role, String status) {
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.status = status;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }
}
