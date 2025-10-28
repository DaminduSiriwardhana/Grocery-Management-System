package com.grocery.service;

import com.grocery.dto.DeliveryTrackingDTO;
import com.grocery.model.DeliveryTracking;
import com.grocery.repository.DeliveryTrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DeliveryTrackingService {
    @Autowired
    private DeliveryTrackingRepository deliveryTrackingRepository;

    public DeliveryTrackingDTO createTracking(DeliveryTracking tracking) {
        DeliveryTracking savedTracking = deliveryTrackingRepository.save(tracking);
        return DeliveryTrackingDTO.fromEntity(savedTracking);
    }

    public DeliveryTrackingDTO getTrackingById(Integer trackingId) {
        Optional<DeliveryTracking> tracking = deliveryTrackingRepository.findById(trackingId);
        return tracking.map(DeliveryTrackingDTO::fromEntity).orElse(null);
    }

    public DeliveryTrackingDTO getTrackingByOrderId(Integer orderId) {
        Optional<DeliveryTracking> tracking = deliveryTrackingRepository.findByOrderOrderId(orderId);
        return tracking.map(DeliveryTrackingDTO::fromEntity).orElse(null);
    }

    public List<DeliveryTrackingDTO> getAllTrackings() {
        return deliveryTrackingRepository.findAll().stream()
            .map(DeliveryTrackingDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<DeliveryTrackingDTO> getTrackingsByStatus(DeliveryTracking.DeliveryStatus status) {
        return deliveryTrackingRepository.findAll().stream()
            .filter(t -> t.getCurrentStatus() == status)
            .map(DeliveryTrackingDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<DeliveryTrackingDTO> getTrackingsByDeliveryPerson(Integer deliveryPersonId) {
        return deliveryTrackingRepository.findAll().stream()
            .filter(t -> t.getDeliveryPerson() != null && t.getDeliveryPerson().getUserId().equals(deliveryPersonId))
            .map(DeliveryTrackingDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<DeliveryTrackingDTO> getDelayedDeliveries() {
        LocalDateTime now = LocalDateTime.now();
        return deliveryTrackingRepository.findAll().stream()
            .filter(t -> t.getEstimatedDeliveryTime() != null && 
                    t.getEstimatedDeliveryTime().isBefore(now) &&
                    (t.getCurrentStatus() != DeliveryTracking.DeliveryStatus.DELIVERED &&
                     t.getCurrentStatus() != DeliveryTracking.DeliveryStatus.FAILED))
            .map(DeliveryTrackingDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public DeliveryTrackingDTO updateTracking(Integer trackingId, DeliveryTracking trackingDetails) {
        Optional<DeliveryTracking> tracking = deliveryTrackingRepository.findById(trackingId);
        if (tracking.isPresent()) {
            DeliveryTracking existingTracking = tracking.get();
            existingTracking.setCurrentStatus(trackingDetails.getCurrentStatus());
            existingTracking.setCurrentLocation(trackingDetails.getCurrentLocation());
            existingTracking.setEstimatedDeliveryTime(trackingDetails.getEstimatedDeliveryTime());
            
            // Set actual delivery time if status is DELIVERED
            if (trackingDetails.getCurrentStatus() == DeliveryTracking.DeliveryStatus.DELIVERED) {
                existingTracking.setActualDeliveryTime(LocalDateTime.now());
            }
            
            DeliveryTracking updatedTracking = deliveryTrackingRepository.save(existingTracking);
            return DeliveryTrackingDTO.fromEntity(updatedTracking);
        }
        return null;
    }

    public DeliveryTrackingDTO updateDeliveryStatus(Integer trackingId, DeliveryTracking.DeliveryStatus status) {
        Optional<DeliveryTracking> tracking = deliveryTrackingRepository.findById(trackingId);
        if (tracking.isPresent()) {
            DeliveryTracking existingTracking = tracking.get();
            existingTracking.setCurrentStatus(status);
            
            if (status == DeliveryTracking.DeliveryStatus.DELIVERED) {
                existingTracking.setActualDeliveryTime(LocalDateTime.now());
            }
            
            DeliveryTracking updatedTracking = deliveryTrackingRepository.save(existingTracking);
            return DeliveryTrackingDTO.fromEntity(updatedTracking);
        }
        return null;
    }

    public DeliveryTrackingDTO updateDeliveryLocation(Integer trackingId, String location) {
        Optional<DeliveryTracking> tracking = deliveryTrackingRepository.findById(trackingId);
        if (tracking.isPresent()) {
            DeliveryTracking existingTracking = tracking.get();
            existingTracking.setCurrentLocation(location);
            DeliveryTracking updatedTracking = deliveryTrackingRepository.save(existingTracking);
            return DeliveryTrackingDTO.fromEntity(updatedTracking);
        }
        return null;
    }

    public boolean deleteTracking(Integer trackingId) {
        if (deliveryTrackingRepository.existsById(trackingId)) {
            deliveryTrackingRepository.deleteById(trackingId);
            return true;
        }
        return false;
    }

    public java.util.Map<String, Long> getDeliveryStatistics() {
        List<DeliveryTracking> allTrackings = deliveryTrackingRepository.findAll();
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        
        stats.put("TOTAL", (long) allTrackings.size());
        stats.put("PENDING", allTrackings.stream().filter(t -> t.getCurrentStatus() == DeliveryTracking.DeliveryStatus.PENDING).count());
        stats.put("PICKED_UP", allTrackings.stream().filter(t -> t.getCurrentStatus() == DeliveryTracking.DeliveryStatus.PICKED_UP).count());
        stats.put("IN_TRANSIT", allTrackings.stream().filter(t -> t.getCurrentStatus() == DeliveryTracking.DeliveryStatus.IN_TRANSIT).count());
        stats.put("DELIVERED", allTrackings.stream().filter(t -> t.getCurrentStatus() == DeliveryTracking.DeliveryStatus.DELIVERED).count());
        stats.put("FAILED", allTrackings.stream().filter(t -> t.getCurrentStatus() == DeliveryTracking.DeliveryStatus.FAILED).count());
        
        return stats;
    }
}
