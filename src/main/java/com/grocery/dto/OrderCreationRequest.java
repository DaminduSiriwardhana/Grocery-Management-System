package com.grocery.dto;

import com.grocery.model.Order;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderCreationRequest {
    private Integer userId;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private String deliveryAddress;
    private String deliveryName;
    private String deliveryPhone;
    private String orderNotes;
    private String paymentMethod;
    private List<OrderItemRequest> orderItems;
    
    @Data
    public static class OrderItemRequest {
        private Integer productId;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}
