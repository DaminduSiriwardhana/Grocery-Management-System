package com.grocery.service;

import com.grocery.dto.*;
import com.grocery.model.*;
import com.grocery.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DeliveryDashboardService {

    @Autowired
    private DeliveryTrackingRepository deliveryTrackingRepository;

    @Autowired
    private DeliveryTimeSlotRepository deliveryTimeSlotRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    public DeliveryStatsDTO getDeliveryStats(Integer deliveryPersonId) {
        User deliveryPerson = userRepository.findById(deliveryPersonId).orElse(null);
        if (deliveryPerson == null) {
            return new DeliveryStatsDTO(0, 0, 0, 0.0, 0, 0.0, 0.0);
        }

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        // Count pending deliveries
        long pendingDeliveries = deliveryTrackingRepository.countByDeliveryPersonAndCurrentStatus(
            deliveryPerson, DeliveryTracking.DeliveryStatus.PENDING);

        // Count in transit deliveries
        long inTransit = deliveryTrackingRepository.countByDeliveryPersonAndCurrentStatus(
            deliveryPerson, DeliveryTracking.DeliveryStatus.IN_TRANSIT);

        // Count completed today
        long completedToday = deliveryTrackingRepository.countByDeliveryPersonAndCurrentStatusAndActualDeliveryTimeBetween(
            deliveryPerson, DeliveryTracking.DeliveryStatus.DELIVERED, startOfDay, endOfDay);

        // Calculate total earnings (assuming $5 per delivery)
        long totalDeliveries = deliveryTrackingRepository.countByDeliveryPersonAndCurrentStatus(
            deliveryPerson, DeliveryTracking.DeliveryStatus.DELIVERED);
        double totalEarnings = totalDeliveries * 5.0;

        // Calculate success rate
        long totalAttempts = deliveryTrackingRepository.countByDeliveryPerson(deliveryPerson);
        double successRate = totalAttempts > 0 ? (double) totalDeliveries / totalAttempts * 100 : 0.0;

        return new DeliveryStatsDTO(
            (int) pendingDeliveries,
            (int) inTransit,
            (int) completedToday,
            totalEarnings,
            (int) totalDeliveries,
            successRate,
            4.5 // Placeholder average rating
        );
    }

    public List<DeliveryTrackingDTO> getDeliveryOrders(Integer deliveryPersonId) {
        User deliveryPerson = userRepository.findById(deliveryPersonId).orElse(null);
        if (deliveryPerson == null) {
            return List.of();
        }

        List<DeliveryTracking> deliveries = deliveryTrackingRepository.findByDeliveryPerson(deliveryPerson);
        return deliveries.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public DeliveryTrackingDTO getDeliveryOrder(Integer orderId) {
        DeliveryTracking delivery = deliveryTrackingRepository.findByOrderOrderId(orderId).orElse(null);
        return delivery != null ? convertToDTO(delivery) : null;
    }

    public DeliveryTrackingDTO updateDeliveryStatus(StatusUpdateRequest request) {
        DeliveryTracking delivery = deliveryTrackingRepository.findByOrderOrderId(request.getOrderId()).orElse(null);
        if (delivery == null) {
            return null;
        }

        User deliveryPerson = userRepository.findById(request.getDeliveryPersonId()).orElse(null);
        if (deliveryPerson == null) {
            return null;
        }

        delivery.setDeliveryPerson(deliveryPerson);
        delivery.setCurrentStatus(DeliveryTracking.DeliveryStatus.valueOf(request.getCurrentStatus()));
        delivery.setCurrentLocation(request.getCurrentLocation());
        delivery.setDeliveryNotes(request.getDeliveryNotes());

        if (request.getCurrentStatus().equals("DELIVERED")) {
            delivery.setActualDeliveryTime(LocalDateTime.now());
        }

        DeliveryTracking savedDelivery = deliveryTrackingRepository.save(delivery);
        return convertToDTO(savedDelivery);
    }

    public List<TimeSlotDTO> getDeliverySchedule(Integer deliveryPersonId, LocalDate date) {
        User deliveryPerson = userRepository.findById(deliveryPersonId).orElse(null);
        if (deliveryPerson == null) {
            return List.of();
        }

        List<DeliveryTimeSlot> timeSlots = deliveryTimeSlotRepository.findByDeliveryPersonAndDateOrderByStartTime(
            deliveryPerson, date);

        return timeSlots.stream()
            .map(this::convertTimeSlotToDTO)
            .collect(Collectors.toList());
    }

    public TimeSlotDTO createTimeSlot(TimeSlotDTO timeSlotDTO) {
        User deliveryPerson = userRepository.findById(timeSlotDTO.getDeliveryPersonId()).orElse(null);
        if (deliveryPerson == null) {
            return null;
        }

        DeliveryTimeSlot timeSlot = new DeliveryTimeSlot();
        timeSlot.setDeliveryPerson(deliveryPerson);
        timeSlot.setDate(timeSlotDTO.getDate());
        timeSlot.setStartTime(timeSlotDTO.getStartTime());
        timeSlot.setEndTime(timeSlotDTO.getEndTime());
        timeSlot.setMaxOrders(timeSlotDTO.getMaxOrders());
        timeSlot.setNotes(timeSlotDTO.getNotes());

        DeliveryTimeSlot savedTimeSlot = deliveryTimeSlotRepository.save(timeSlot);
        return convertTimeSlotToDTO(savedTimeSlot);
    }

    public TimeSlotDTO updateTimeSlot(Integer slotId, TimeSlotDTO timeSlotDTO) {
        DeliveryTimeSlot timeSlot = deliveryTimeSlotRepository.findById(slotId).orElse(null);
        if (timeSlot == null) {
            return null;
        }

        timeSlot.setDate(timeSlotDTO.getDate());
        timeSlot.setStartTime(timeSlotDTO.getStartTime());
        timeSlot.setEndTime(timeSlotDTO.getEndTime());
        timeSlot.setMaxOrders(timeSlotDTO.getMaxOrders());
        timeSlot.setNotes(timeSlotDTO.getNotes());

        DeliveryTimeSlot savedTimeSlot = deliveryTimeSlotRepository.save(timeSlot);
        return convertTimeSlotToDTO(savedTimeSlot);
    }

    public boolean deleteTimeSlot(Integer slotId) {
        try {
            deliveryTimeSlotRepository.deleteById(slotId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean deleteDeliveryOrder(Integer orderId) {
        try {
            DeliveryTracking delivery = deliveryTrackingRepository.findByOrderOrderId(orderId).orElse(null);
            if (delivery != null) {
                deliveryTrackingRepository.delete(delivery);
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private DeliveryTrackingDTO convertToDTO(DeliveryTracking delivery) {
        DeliveryTrackingDTO dto = new DeliveryTrackingDTO();
        dto.setTrackingId(delivery.getTrackingId());
        dto.setOrderId(delivery.getOrder().getOrderId());
        dto.setDeliveryPersonId(delivery.getDeliveryPerson() != null ? delivery.getDeliveryPerson().getUserId() : null);
        dto.setCurrentStatus(delivery.getCurrentStatus().toString());
        dto.setCurrentLocation(delivery.getCurrentLocation());
        dto.setEstimatedDeliveryTime(delivery.getEstimatedDeliveryTime());
        dto.setActualDeliveryTime(delivery.getActualDeliveryTime());
        dto.setTimeSlot(delivery.getTimeSlot() != null ? delivery.getTimeSlot().getSlotId().toString() : null);
        dto.setDeliveryNotes(delivery.getDeliveryNotes());

        // Add order details
        Order order = delivery.getOrder();
        if (order != null) {
            dto.setCustomerName(order.getUser().getUsername());
            dto.setCustomerEmail(order.getUser().getEmail());
            dto.setCustomerPhone(order.getUser().getPhone());
            dto.setDeliveryAddress(order.getDeliveryAddress());
            dto.setTotalAmount(order.getTotalAmount());
        }

        return dto;
    }

    private TimeSlotDTO convertTimeSlotToDTO(DeliveryTimeSlot timeSlot) {
        TimeSlotDTO dto = new TimeSlotDTO();
        dto.setSlotId(timeSlot.getSlotId());
        dto.setDeliveryPersonId(timeSlot.getDeliveryPerson().getUserId());
        dto.setDate(timeSlot.getDate());
        dto.setStartTime(timeSlot.getStartTime());
        dto.setEndTime(timeSlot.getEndTime());
        dto.setMaxOrders(timeSlot.getMaxOrders());
        dto.setNotes(timeSlot.getNotes());

        // Get orders for this time slot
        List<DeliveryTracking> deliveries = deliveryTrackingRepository.findByTimeSlot(timeSlot);
        List<OrderDTO> orders = deliveries.stream()
            .map(delivery -> {
                OrderDTO orderDTO = new OrderDTO();
                orderDTO.setOrderId(delivery.getOrder().getOrderId());
                orderDTO.setDeliveryAddress(delivery.getOrder().getDeliveryAddress());
                orderDTO.setTotalAmount(delivery.getOrder().getTotalAmount());
                return orderDTO;
            })
            .collect(Collectors.toList());
        dto.setOrders(orders);

        return dto;
    }
}
