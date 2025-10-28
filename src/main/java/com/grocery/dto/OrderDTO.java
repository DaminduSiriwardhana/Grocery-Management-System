package com.grocery.dto;

import com.grocery.model.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Integer orderId;
    private Integer userId;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String status;
    private String deliveryAddress;
    private LocalDate deliveryDate;
    private List<OrderItemDTO> orderItems;

    public static OrderDTO fromEntity(Order order) {
        return new OrderDTO(
            order.getOrderId(),
            order.getUser().getUserId(),
            order.getOrderDate(),
            order.getTotalAmount(),
            order.getStatus().toString(),
            order.getDeliveryAddress(),
            order.getDeliveryDate(),
            order.getOrderItems() != null ? 
                order.getOrderItems().stream()
                    .map(OrderItemDTO::fromEntity)
                    .collect(Collectors.toList()) : 
                null
        );
    }
}
