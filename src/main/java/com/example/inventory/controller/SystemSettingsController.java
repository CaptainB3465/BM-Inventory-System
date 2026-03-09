package com.example.inventory.controller;

import com.example.inventory.model.SystemSettings;
import com.example.inventory.service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SystemSettingsController {

    @Autowired
    private SystemSettingsService settingsService;

    @GetMapping
    public SystemSettings getSettings() {
        return settingsService.getSettings();
    }

    @PutMapping
    public SystemSettings updateSettings(@RequestBody SystemSettings settings) {
        return settingsService.updateSettings(settings);
    }
}
