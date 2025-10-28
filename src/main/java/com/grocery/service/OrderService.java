package com.grocery.service;

import com.grocery.dto.OrderDTO;
import com.grocery.dto.OrderCreationRequest;
import com.grocery.model.Order;
import com.grocery.model.OrderItem;
import com.grocery.model.User;
import com.grocery.repository.OrderRepository;
import com.grocery.repository.OrderItemRepository;
import com.grocery.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    public OrderDTO createOrder(Order order) {
        // If order has userId but no user entity, fetch the user
        if (order.getUser() == null && order.getUserId() != null) {
            Optional<User> user = userRepository.findById(order.getUserId());
            if (user.isPresent()) {
                order.setUser(user.get());
            } else {
                throw new RuntimeException("User not found with ID: " + order.getUserId());
            }
        }
        
        // Clear order items from the order to avoid cascade issues
        order.setOrderItems(null);
        
        // Save the order first to get the ID
        Order savedOrder = orderRepository.save(order);
        
        // Note: Order items will be handled separately if needed
        // For now, we'll just save the order without items
        // This prevents the cascade issue with OrderItem
        
        return OrderDTO.fromEntity(savedOrder);
    }

    public OrderDTO getOrderById(Integer orderId) {
        Optional<Order> order = orderRepository.findById(orderId);
        return order.map(OrderDTO::fromEntity).orElse(null);
    }

    public List<OrderDTO> getOrdersByUserId(Integer userId) {
        return orderRepository.findByUserUserId(userId).stream()
            .map(OrderDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
            .map(OrderDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
            .map(OrderDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public OrderDTO updateOrderStatus(Integer orderId, Order.OrderStatus status) {
        Optional<Order> order = orderRepository.findById(orderId);
        if (order.isPresent()) {
            Order existingOrder = order.get();
            existingOrder.setStatus(status);
            Order updatedOrder = orderRepository.save(existingOrder);
            return OrderDTO.fromEntity(updatedOrder);
        }
        return null;
    }

    public boolean deleteOrder(Integer orderId) {
        if (orderRepository.existsById(orderId)) {
            orderRepository.deleteById(orderId);
            return true;
        }
        return false;
    }
}
