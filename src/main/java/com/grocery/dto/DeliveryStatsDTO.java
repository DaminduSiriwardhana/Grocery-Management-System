package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryStatsDTO {
    private Integer pendingDeliveries;
    private Integer inTransit;
    private Integer completedToday;
    private Double totalEarnings;
    private Integer totalDeliveries;
    private Double successRate;
    private Double averageRating;
}
