package com.example.inventory.model;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String passcode;
    private String confirmPasscode;

    public RegisterRequest() {}

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasscode() {
        return passcode;
    }

    public void setPasscode(String passcode) {
        this.passcode = passcode;
    }

    public String getConfirmPasscode() {
        return confirmPasscode;
    }

    public void setConfirmPasscode(String confirmPasscode) {
        this.confirmPasscode = confirmPasscode;
    }
}
