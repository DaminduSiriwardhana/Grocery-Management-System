package com.grocery.repository;

import com.grocery.model.DeliveryTimeSlot;
import com.grocery.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DeliveryTimeSlotRepository extends JpaRepository<DeliveryTimeSlot, Integer> {
    
    List<DeliveryTimeSlot> findByDeliveryPersonAndDate(User deliveryPerson, LocalDate date);
    
    List<DeliveryTimeSlot> findByDeliveryPerson(User deliveryPerson);
    
    @Query("SELECT ts FROM DeliveryTimeSlot ts WHERE ts.deliveryPerson = :deliveryPerson AND ts.date = :date ORDER BY ts.startTime")
    List<DeliveryTimeSlot> findByDeliveryPersonAndDateOrderByStartTime(@Param("deliveryPerson") User deliveryPerson, @Param("date") LocalDate date);
    
    @Query("SELECT COUNT(dt) FROM DeliveryTracking dt WHERE dt.timeSlot = :timeSlot")
    Integer countDeliveriesByTimeSlot(@Param("timeSlot") DeliveryTimeSlot timeSlot);
}
