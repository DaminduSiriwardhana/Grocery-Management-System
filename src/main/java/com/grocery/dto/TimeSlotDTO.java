package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlotDTO {
    private Integer slotId;
    private Integer deliveryPersonId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer maxOrders;
    private String notes;
    private List<OrderDTO> orders;
}
