package com.example.inventory.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "system_settings")
public class SystemSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String currency;
    private int lowStockThreshold;
    private boolean enableChatbot;
    private String contactEmail;
    private String theme; // "Light" or "Dark"

    public SystemSettings() {}

    public SystemSettings(String companyName, String currency, int lowStockThreshold, boolean enableChatbot, String contactEmail, String theme) {
        this.companyName = companyName;
        this.currency = currency;
        this.lowStockThreshold = lowStockThreshold;
        this.enableChatbot = enableChatbot;
        this.contactEmail = contactEmail;
        this.theme = theme;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public boolean isEnableChatbot() { return enableChatbot; }
    public void setEnableChatbot(boolean enableChatbot) { this.enableChatbot = enableChatbot; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}
