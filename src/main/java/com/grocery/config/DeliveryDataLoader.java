package com.grocery.config;

import com.grocery.model.*;
import com.grocery.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DeliveryDataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DeliveryTrackingRepository deliveryTrackingRepository;

    @Autowired
    private DeliveryTimeSlotRepository deliveryTimeSlotRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create delivery person if not exists
        if (!userRepository.findByEmail("delivery@grocery.com").isPresent()) {
            User deliveryPerson = new User();
            deliveryPerson.setUsername("delivery_person");
            deliveryPerson.setEmail("delivery@grocery.com");
            deliveryPerson.setPassword("$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi"); // delivery123
            deliveryPerson.setRole(User.UserRole.DELIVERY_PERSON);
            deliveryPerson.setPhone("555-0123");
            deliveryPerson.setAddress("123 Delivery St");
            deliveryPerson.setCity("Delivery City");
            deliveryPerson.setPostalCode("12345");
            userRepository.save(deliveryPerson);
        }

        // Create sample time slots for today
        User deliveryPerson = userRepository.findByEmail("delivery@grocery.com").orElse(null);
        if (deliveryPerson != null) {
            LocalDate today = LocalDate.now();
            
            // Check if time slots already exist for today
            if (deliveryTimeSlotRepository.findByDeliveryPersonAndDate(deliveryPerson, today).isEmpty()) {
                // Morning slot
                DeliveryTimeSlot morningSlot = new DeliveryTimeSlot();
                morningSlot.setDeliveryPerson(deliveryPerson);
                morningSlot.setDate(today);
                morningSlot.setStartTime(LocalTime.of(9, 0));
                morningSlot.setEndTime(LocalTime.of(12, 0));
                morningSlot.setMaxOrders(5);
                morningSlot.setNotes("Morning delivery slot");
                deliveryTimeSlotRepository.save(morningSlot);

                // Afternoon slot
                DeliveryTimeSlot afternoonSlot = new DeliveryTimeSlot();
                afternoonSlot.setDeliveryPerson(deliveryPerson);
                afternoonSlot.setDate(today);
                afternoonSlot.setStartTime(LocalTime.of(13, 0));
                afternoonSlot.setEndTime(LocalTime.of(17, 0));
                afternoonSlot.setMaxOrders(5);
                afternoonSlot.setNotes("Afternoon delivery slot");
                deliveryTimeSlotRepository.save(afternoonSlot);

                // Evening slot
                DeliveryTimeSlot eveningSlot = new DeliveryTimeSlot();
                eveningSlot.setDeliveryPerson(deliveryPerson);
                eveningSlot.setDate(today);
                eveningSlot.setStartTime(LocalTime.of(18, 0));
                eveningSlot.setEndTime(LocalTime.of(21, 0));
                eveningSlot.setMaxOrders(3);
                eveningSlot.setNotes("Evening delivery slot");
                deliveryTimeSlotRepository.save(eveningSlot);
            }

            // Create sample delivery tracking entries for existing orders
            if (deliveryTrackingRepository.count() == 0) {
                // Get some existing orders
                orderRepository.findAll().stream()
                    .limit(3)
                    .forEach(order -> {
                        DeliveryTracking tracking = new DeliveryTracking();
                        tracking.setOrder(order);
                        tracking.setDeliveryPerson(deliveryPerson);
                        tracking.setCurrentStatus(DeliveryTracking.DeliveryStatus.PENDING);
                        tracking.setCurrentLocation("Warehouse");
                        tracking.setEstimatedDeliveryTime(LocalDateTime.now().plusHours(2));
                        deliveryTrackingRepository.save(tracking);
                    });
            }
        }
    }
}
