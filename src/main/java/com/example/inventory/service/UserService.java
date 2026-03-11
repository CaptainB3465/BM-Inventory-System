package com.example.inventory.service;

import com.example.inventory.model.User;
import com.example.inventory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(String fullName, String email, String passcode) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use.");
        }
        if (passcode.length() < 6) {
            throw new RuntimeException("Passcode must be at least 6 characters long.");
        }
        User user = new User(fullName, email, passcode, "CUSTOMER");
        return userRepository.save(user);
    }

    public Optional<User> loginUser(String email, String passcode) {
        return userRepository.findByEmail(email)
                .filter(user -> user.getPasscode().equals(passcode));
    }

    public String generateResetCode(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String resetCode = String.format("%06d", new Random().nextInt(1000000));
            user.setResetCode(resetCode);
            userRepository.save(user);
            // In a real app, send this code via email.
            System.out.println("Reset code for " + email + ": " + resetCode);
            return resetCode;
        }
        throw new RuntimeException("User not found with email: " + email);
    }

    public boolean resetPasscode(String email, String resetCode, String newPasscode, String confirmPasscode) {
        if (!newPasscode.equals(confirmPasscode)) {
            throw new RuntimeException("Passcodes do not match.");
        }
        if (newPasscode.length() < 6) {
            throw new RuntimeException("Passcode must be at least 6 characters long.");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (resetCode.equals(user.getResetCode())) {
                user.setPasscode(newPasscode);
                user.setResetCode(null); // Clear reset code after use
                userRepository.save(user);
                return true;
            } else {
                throw new RuntimeException("Invalid reset code.");
            }
        }
        throw new RuntimeException("User not found.");
    }
}
