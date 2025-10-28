package com.grocery.controller;

import com.grocery.dto.*;
import com.grocery.service.DeliveryDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/delivery-dashboard")
@CrossOrigin(origins = "*")
public class DeliveryDashboardController {

    @Autowired
    private DeliveryDashboardService deliveryDashboardService;

    @GetMapping("/stats/{deliveryPersonId}")
    public ResponseEntity<DeliveryStatsDTO> getDeliveryStats(@PathVariable Integer deliveryPersonId) {
        try {
            DeliveryStatsDTO stats = deliveryDashboardService.getDeliveryStats(deliveryPersonId);
            return new ResponseEntity<>(stats, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/orders/{deliveryPersonId}")
    public ResponseEntity<List<DeliveryTrackingDTO>> getDeliveryOrders(@PathVariable Integer deliveryPersonId) {
        try {
            List<DeliveryTrackingDTO> orders = deliveryDashboardService.getDeliveryOrders(deliveryPersonId);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<DeliveryTrackingDTO> getDeliveryOrder(@PathVariable Integer orderId) {
        try {
            DeliveryTrackingDTO order = deliveryDashboardService.getDeliveryOrder(orderId);
            if (order != null) {
                return new ResponseEntity<>(order, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update-status")
    public ResponseEntity<DeliveryTrackingDTO> updateDeliveryStatus(@RequestBody StatusUpdateRequest request) {
        try {
            DeliveryTrackingDTO updatedOrder = deliveryDashboardService.updateDeliveryStatus(request);
            if (updatedOrder != null) {
                return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/schedule/{deliveryPersonId}")
    public ResponseEntity<List<TimeSlotDTO>> getDeliverySchedule(
            @PathVariable Integer deliveryPersonId,
            @RequestParam(required = false) String date) {
        try {
            LocalDate scheduleDate = date != null ? LocalDate.parse(date) : LocalDate.now();
            List<TimeSlotDTO> schedule = deliveryDashboardService.getDeliverySchedule(deliveryPersonId, scheduleDate);
            return new ResponseEntity<>(schedule, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/time-slots")
    public ResponseEntity<TimeSlotDTO> createTimeSlot(@RequestBody TimeSlotDTO timeSlotDTO) {
        try {
            TimeSlotDTO createdTimeSlot = deliveryDashboardService.createTimeSlot(timeSlotDTO);
            if (createdTimeSlot != null) {
                return new ResponseEntity<>(createdTimeSlot, HttpStatus.CREATED);
            }
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/time-slots/{slotId}")
    public ResponseEntity<TimeSlotDTO> updateTimeSlot(@PathVariable Integer slotId, @RequestBody TimeSlotDTO timeSlotDTO) {
        try {
            TimeSlotDTO updatedTimeSlot = deliveryDashboardService.updateTimeSlot(slotId, timeSlotDTO);
            if (updatedTimeSlot != null) {
                return new ResponseEntity<>(updatedTimeSlot, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/time-slots/{slotId}")
    public ResponseEntity<Void> deleteTimeSlot(@PathVariable Integer slotId) {
        try {
            boolean deleted = deliveryDashboardService.deleteTimeSlot(slotId);
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/orders/{orderId}")
    public ResponseEntity<Void> deleteDeliveryOrder(@PathVariable Integer orderId) {
        try {
            boolean deleted = deliveryDashboardService.deleteDeliveryOrder(orderId);
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
