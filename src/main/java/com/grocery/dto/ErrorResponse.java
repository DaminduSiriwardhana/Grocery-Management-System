package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private boolean success;
    private String message;
    private String error;
    
    public ErrorResponse(String message) {
        this.success = false;
        this.message = message;
        this.error = message;
    }
}

