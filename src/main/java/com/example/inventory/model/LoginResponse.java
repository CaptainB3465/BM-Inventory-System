package com.example.inventory.model;

public class LoginResponse {
    private String username;
    private String role;
    private String status;

    public LoginResponse(String username, String role, String status) {
        this.username = username;
        this.role = role;
        this.status = status;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }
}
