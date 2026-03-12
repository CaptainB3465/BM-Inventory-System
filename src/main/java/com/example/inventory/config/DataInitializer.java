package com.example.inventory.config;

import com.example.inventory.model.Product;
import com.example.inventory.model.User;
import com.example.inventory.repository.ProductRepository;
import com.example.inventory.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, ProductRepository productRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed admin user if not present — uses bcrypt so login works
        if (!userRepository.existsByEmail("admin@example.com")) {
            userRepository.save(new User("Admin User", "admin@example.com", passwordEncoder.encode("admin123"), "ADMIN"));
        }

        // Seed demo customer user if not present
        if (!userRepository.existsByEmail("customer@example.com")) {
            userRepository.save(new User("Demo Customer", "customer@example.com", passwordEncoder.encode("cust123"), "CUSTOMER"));
        }

        // Seed initial products if empty
        if (productRepository.count() == 0) {
            productRepository.save(new Product("Ultra-HD 4K Monitor", "27-inch IPS display, 144Hz refresh rate", 30, 399.99, "ELE-1001"));
            productRepository.save(new Product("Nueral Sound Wireless Headphones", "Noise-cancelling, 40h battery life", 55, 249.50, "ELE-1002"));
            productRepository.save(new Product("ProGamer Mechanical Keyboard", "RGB Lighting, Brown Switches", 25, 129.00, "ELE-1003"));
            productRepository.save(new Product("ErgoTrack Wireless Mouse", "High precision sensor, ergonomic design", 150, 59.99, "ELE-1004"));
            productRepository.save(new Product("Multi-Port USB-C Hub", "8-in-1 adapter with HDMI and SD card reader", 85, 45.00, "ELE-1005"));
            productRepository.save(new Product("SmartHome Security Camera", "1080p HD, Night vision, Two-way audio", 40, 89.99, "ELE-1006"));
            productRepository.save(new Product("Portable SSD 1TB", "High-speed NVMe, USB 3.2 Gen 2", 60, 115.00, "ELE-1007"));
            productRepository.save(new Product("Thunderbolt 4 Docking Station", "Triple 4K display support, 100W PD", 15, 299.00, "ELE-1008"));
            productRepository.save(new Product("Noise-Isolating Earbuds", "TWS, IPX7 water resistant, compact case", 200, 79.50, "ELE-1009"));
            productRepository.save(new Product("Dual-Band WiFi 6 Router", "Multi-gigabit speed, expanded coverage", 35, 159.99, "ELE-1010"));
        }

        // No customer seed data — customers are managed entirely by the admin.
    }
}
