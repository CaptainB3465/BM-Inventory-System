package com.example.inventory.controller;

import com.example.inventory.model.*;
import com.example.inventory.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final com.example.inventory.repository.CustomerRepository customerRepository;

    @Autowired
    public AuthController(UserService userService, com.example.inventory.repository.CustomerRepository customerRepository) {
        this.userService = userService;
        this.customerRepository = customerRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (!request.getPasscode().equals(request.getConfirmPasscode())) {
                return ResponseEntity.badRequest().body("Passcodes do not match.");
            }
            User user = userService.registerUser(request.getFullName(), request.getEmail(), request.getPasscode());
            
            // Also provision the Customer record
            Customer customer = new Customer();
            customer.setName(request.getFullName());
            customer.setEmail(request.getEmail());
            customer.setStatus("Active");
            customer.setTotalOrders(0);
            customerRepository.save(customer);

            return ResponseEntity.ok(new LoginResponse(user.getEmail(), user.getFullName(), user.getRole(), "SUCCESS"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userService.loginUser(request.getEmail(), request.getPasscode());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return ResponseEntity.ok(new LoginResponse(user.getEmail(), user.getFullName(), user.getRole(), "SUCCESS"));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new LoginResponse(request.getEmail(), null, null, "INVALID_CREDENTIALS"));
    }

    @PostMapping("/forgot-passcode")
    public ResponseEntity<?> forgotPasscode(@RequestBody ForgotPasscodeRequest request) {
        try {
            String resetCode = userService.generateResetCode(request.getEmail());
            // In a real app, you wouldn't return the code, but for this demo/exercise, we might.
            // However, the service logs it, so we can just say success.
            return ResponseEntity.ok("Reset code sent to your email.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-passcode")
    public ResponseEntity<?> resetPasscode(@RequestBody ResetPasscodeRequest request) {
        try {
            userService.resetPasscode(request.getEmail(), request.getResetCode(), request.getNewPasscode(), request.getConfirmPasscode());
            return ResponseEntity.ok("Passcode reset successfully.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
