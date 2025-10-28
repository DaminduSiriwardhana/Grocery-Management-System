package com.grocery.service;

import com.grocery.dto.LoginRequest;
import com.grocery.dto.LoginResponse;
import com.grocery.dto.UserDTO;
import com.grocery.dto.UserRegistrationRequest;
import com.grocery.model.User;
import com.grocery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserDTO createUser(User user) {
        // Hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }

    public UserDTO registerUser(UserRegistrationRequest request) {
        try {
            // Validate required fields
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                throw new RuntimeException("Username is required");
            }
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                throw new RuntimeException("Email is required");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                throw new RuntimeException("Password is required");
            }
            if (request.getRole() == null || request.getRole().trim().isEmpty()) {
                throw new RuntimeException("Role is required");
            }

            // Check if user already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already registered");
            }
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new RuntimeException("Username already taken");
            }

            // Validate email format
            if (!request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                throw new RuntimeException("Invalid email format");
            }

            // Validate password length
            if (request.getPassword().length() < 6) {
                throw new RuntimeException("Password must be at least 6 characters long");
            }

            User user = new User();
            user.setUsername(request.getUsername().trim());
            user.setEmail(request.getEmail().trim().toLowerCase());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
            user.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
            user.setCity(request.getCity() != null ? request.getCity().trim() : null);
            user.setPostalCode(request.getPostalCode() != null ? request.getPostalCode().trim() : null);
            
            try {
                user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role: " + request.getRole());
            }

            User savedUser = userRepository.save(user);
            return UserDTO.fromEntity(savedUser);
            
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public LoginResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isEmpty()) {
            return new LoginResponse(false, "User not found", null, null);
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new LoginResponse(false, "Invalid password", null, null);
        }

        return new LoginResponse(true, "Login successful", UserDTO.fromEntity(user), generateToken(user));
    }

    private String generateToken(User user) {
        return Base64.getEncoder().encodeToString((user.getUserId() + ":" + System.currentTimeMillis()).getBytes());
    }

    public UserDTO getUserById(Integer userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.map(UserDTO::fromEntity).orElse(null);
    }

    public UserDTO getUserByUsername(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.map(UserDTO::fromEntity).orElse(null);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(UserDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public UserDTO updateUser(Integer userId, User userDetails) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            User existingUser = user.get();
            existingUser.setUsername(userDetails.getUsername());
            existingUser.setEmail(userDetails.getEmail());
            existingUser.setPhone(userDetails.getPhone());
            existingUser.setAddress(userDetails.getAddress());
            existingUser.setCity(userDetails.getCity());
            existingUser.setPostalCode(userDetails.getPostalCode());
            
            // Only update password if provided
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            }
            
            if (userDetails.getRole() != null) {
                existingUser.setRole(userDetails.getRole());
            }
            
            User updatedUser = userRepository.save(existingUser);
            return UserDTO.fromEntity(updatedUser);
        }
        return null;
    }

    public boolean deleteUser(Integer userId) {
        if (userRepository.existsById(userId)) {
            userRepository.deleteById(userId);
            return true;
        }
        return false;
    }

    public List<UserDTO> getUsersByRole(String role) {
        return userRepository.findAll().stream()
            .filter(u -> u.getRole().toString().equals(role))
            .map(UserDTO::fromEntity)
            .collect(Collectors.toList());
    }
}
