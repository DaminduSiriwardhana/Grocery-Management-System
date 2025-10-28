package com.grocery.controller;

import com.grocery.dto.DeliveryTrackingDTO;
import com.grocery.model.DeliveryTracking;
import com.grocery.service.DeliveryTrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/delivery")
@CrossOrigin(origins = "*")
public class DeliveryTrackingController {
    @Autowired
    private DeliveryTrackingService deliveryTrackingService;

    @PostMapping
    public ResponseEntity<DeliveryTrackingDTO> createTracking(@RequestBody DeliveryTracking tracking) {
        DeliveryTrackingDTO createdTracking = deliveryTrackingService.createTracking(tracking);
        return new ResponseEntity<>(createdTracking, HttpStatus.CREATED);
    }

    @GetMapping("/{trackingId}")
    public ResponseEntity<DeliveryTrackingDTO> getTrackingById(@PathVariable Integer trackingId) {
        DeliveryTrackingDTO tracking = deliveryTrackingService.getTrackingById(trackingId);
        if (tracking != null) {
            return new ResponseEntity<>(tracking, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<DeliveryTrackingDTO> getTrackingByOrderId(@PathVariable Integer orderId) {
        DeliveryTrackingDTO tracking = deliveryTrackingService.getTrackingByOrderId(orderId);
        if (tracking != null) {
            return new ResponseEntity<>(tracking, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping
    public ResponseEntity<List<DeliveryTrackingDTO>> getAllTrackings() {
        List<DeliveryTrackingDTO> trackings = deliveryTrackingService.getAllTrackings();
        return new ResponseEntity<>(trackings, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DeliveryTrackingDTO>> getTrackingsByStatus(@PathVariable String status) {
        try {
            List<DeliveryTrackingDTO> trackings = deliveryTrackingService.getTrackingsByStatus(DeliveryTracking.DeliveryStatus.valueOf(status));
            return new ResponseEntity<>(trackings, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/person/{deliveryPersonId}")
    public ResponseEntity<List<DeliveryTrackingDTO>> getTrackingsByDeliveryPerson(@PathVariable Integer deliveryPersonId) {
        List<DeliveryTrackingDTO> trackings = deliveryTrackingService.getTrackingsByDeliveryPerson(deliveryPersonId);
        return new ResponseEntity<>(trackings, HttpStatus.OK);
    }

    @GetMapping("/alerts/delayed")
    public ResponseEntity<List<DeliveryTrackingDTO>> getDelayedDeliveries() {
        List<DeliveryTrackingDTO> trackings = deliveryTrackingService.getDelayedDeliveries();
        return new ResponseEntity<>(trackings, HttpStatus.OK);
    }

    @GetMapping("/analytics/statistics")
    public ResponseEntity<Map<String, Long>> getDeliveryStatistics() {
        Map<String, Long> stats = deliveryTrackingService.getDeliveryStatistics();
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }

    @PutMapping("/{trackingId}")
    public ResponseEntity<DeliveryTrackingDTO> updateTracking(@PathVariable Integer trackingId, @RequestBody DeliveryTracking trackingDetails) {
        DeliveryTrackingDTO updatedTracking = deliveryTrackingService.updateTracking(trackingId, trackingDetails);
        if (updatedTracking != null) {
            return new ResponseEntity<>(updatedTracking, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{trackingId}/status")
    public ResponseEntity<DeliveryTrackingDTO> updateDeliveryStatus(@PathVariable Integer trackingId, @RequestParam String status) {
        try {
            DeliveryTrackingDTO updatedTracking = deliveryTrackingService.updateDeliveryStatus(trackingId, DeliveryTracking.DeliveryStatus.valueOf(status));
            if (updatedTracking != null) {
                return new ResponseEntity<>(updatedTracking, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{trackingId}/location")
    public ResponseEntity<DeliveryTrackingDTO> updateDeliveryLocation(@PathVariable Integer trackingId, @RequestParam String location) {
        DeliveryTrackingDTO updatedTracking = deliveryTrackingService.updateDeliveryLocation(trackingId, location);
        if (updatedTracking != null) {
            return new ResponseEntity<>(updatedTracking, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{trackingId}")
    public ResponseEntity<Void> deleteTracking(@PathVariable Integer trackingId) {
        if (deliveryTrackingService.deleteTracking(trackingId)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
