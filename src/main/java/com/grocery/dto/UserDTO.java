package com.grocery.dto;

import com.grocery.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Integer userId;
    private String username;
    private String email;
    private String phone;
    private String role;
    private String address;
    private String city;
    private String postalCode;

    public static UserDTO fromEntity(User user) {
        return new UserDTO(
            user.getUserId(),
            user.getUsername(),
            user.getEmail(),
            user.getPhone(),
            user.getRole().toString(),
            user.getAddress(),
            user.getCity(),
            user.getPostalCode()
        );
    }
}
