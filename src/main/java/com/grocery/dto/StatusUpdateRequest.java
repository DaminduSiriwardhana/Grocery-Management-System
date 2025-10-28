package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {
    private Integer orderId;
    private Integer deliveryPersonId;
    private String currentStatus;
    private String currentLocation;
    private String deliveryNotes;
}
