package com.example.inventory.service;

import com.example.inventory.model.SystemSettings;
import com.example.inventory.repository.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SystemSettingsService {

    @Autowired
    private SystemSettingsRepository settingsRepository;

    public SystemSettings getSettings() {
        return settingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> createDefaultSettings());
    }

    public SystemSettings updateSettings(SystemSettings newSettings) {
        SystemSettings existing = getSettings();
        existing.setCompanyName(newSettings.getCompanyName());
        existing.setCurrency(newSettings.getCurrency());
        existing.setLowStockThreshold(newSettings.getLowStockThreshold());
        existing.setEnableChatbot(newSettings.isEnableChatbot());
        existing.setContactEmail(newSettings.getContactEmail());
        existing.setTheme(newSettings.getTheme());
        return settingsRepository.save(existing);
    }

    private SystemSettings createDefaultSettings() {
        SystemSettings defaults = new SystemSettings(
                "B-MIS",
                "USD",
                10,
                true,
                "support@b-mis.com",
                "Light"
        );
        return settingsRepository.save(defaults);
    }
}
