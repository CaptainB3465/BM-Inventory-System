package com.example.inventory.model;

public class ResetPasscodeRequest {
    private String email;
    private String resetCode;
    private String newPasscode;
    private String confirmPasscode;

    public ResetPasscodeRequest() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getResetCode() {
        return resetCode;
    }

    public void setResetCode(String resetCode) {
        this.resetCode = resetCode;
    }

    public String getNewPasscode() {
        return newPasscode;
    }

    public void setNewPasscode(String newPasscode) {
        this.newPasscode = newPasscode;
    }

    public String getConfirmPasscode() {
        return confirmPasscode;
    }

    public void setConfirmPasscode(String confirmPasscode) {
        this.confirmPasscode = confirmPasscode;
    }
}
