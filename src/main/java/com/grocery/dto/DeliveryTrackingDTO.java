package com.grocery.dto;

import com.grocery.model.DeliveryTracking;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryTrackingDTO {
    private Integer trackingId;
    private Integer orderId;
    private Integer deliveryPersonId;
    private String deliveryPersonName;
    private String currentStatus;
    private String currentLocation;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime actualDeliveryTime;
    private LocalDateTime createdAt;
    private String deliveryAddress;
    private Long minutesUntilDelivery;
    private Boolean isDelayed;
    private String timeSlot;
    private String deliveryNotes;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private java.math.BigDecimal totalAmount;

    public static DeliveryTrackingDTO fromEntity(DeliveryTracking tracking) {
        DeliveryTrackingDTO dto = new DeliveryTrackingDTO();
        dto.setTrackingId(tracking.getTrackingId());
        dto.setOrderId(tracking.getOrder().getOrderId());
        dto.setDeliveryPersonId(tracking.getDeliveryPerson() != null ? tracking.getDeliveryPerson().getUserId() : null);
        dto.setDeliveryPersonName(tracking.getDeliveryPerson() != null ? tracking.getDeliveryPerson().getUsername() : "Unassigned");
        dto.setCurrentStatus(tracking.getCurrentStatus().toString());
        dto.setCurrentLocation(tracking.getCurrentLocation());
        dto.setEstimatedDeliveryTime(tracking.getEstimatedDeliveryTime());
        dto.setActualDeliveryTime(tracking.getActualDeliveryTime());
        dto.setCreatedAt(tracking.getCreatedAt());
        dto.setDeliveryAddress(tracking.getOrder().getDeliveryAddress());
        dto.setTimeSlot(tracking.getTimeSlot() != null ? tracking.getTimeSlot().getSlotId().toString() : null);
        dto.setDeliveryNotes(tracking.getDeliveryNotes());
        dto.setCustomerName(tracking.getOrder().getUser().getUsername());
        dto.setCustomerEmail(tracking.getOrder().getUser().getEmail());
        dto.setCustomerPhone(tracking.getOrder().getUser().getPhone());
        dto.setTotalAmount(tracking.getOrder().getTotalAmount());
        
        // Calculate minutes until delivery
        if (tracking.getEstimatedDeliveryTime() != null) {
            long minutesUntil = ChronoUnit.MINUTES.between(LocalDateTime.now(), tracking.getEstimatedDeliveryTime());
            dto.setMinutesUntilDelivery(minutesUntil);
            dto.setIsDelayed(minutesUntil < 0);
        }
        
        return dto;
    }
}
