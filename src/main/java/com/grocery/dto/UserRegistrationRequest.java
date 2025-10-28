package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationRequest {
    private String username;
    private String email;
    private String password;
    private String phone;
    private String role;
    private String address;
    private String city;
    private String postalCode;
}
