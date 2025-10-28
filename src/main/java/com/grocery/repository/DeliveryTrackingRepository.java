package com.grocery.repository;

import com.grocery.model.DeliveryTracking;
import com.grocery.model.DeliveryTimeSlot;
import com.grocery.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryTrackingRepository extends JpaRepository<DeliveryTracking, Integer> {
    Optional<DeliveryTracking> findByOrderOrderId(Integer orderId);
    
    List<DeliveryTracking> findByDeliveryPerson(User deliveryPerson);
    
    List<DeliveryTracking> findByTimeSlot(DeliveryTimeSlot timeSlot);
    
    long countByDeliveryPersonAndCurrentStatus(User deliveryPerson, DeliveryTracking.DeliveryStatus status);
    
    long countByDeliveryPerson(User deliveryPerson);
    
    long countByDeliveryPersonAndCurrentStatusAndActualDeliveryTimeBetween(
        User deliveryPerson, 
        DeliveryTracking.DeliveryStatus status, 
        LocalDateTime start, 
        LocalDateTime end
    );
}
