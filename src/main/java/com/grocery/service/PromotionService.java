package com.grocery.service;

import com.grocery.dto.PromotionDTO;
import com.grocery.model.Promotion;
import com.grocery.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PromotionService {
    @Autowired
    private PromotionRepository promotionRepository;

    public PromotionDTO createPromotion(Promotion promotion) {
        if (promotion.getEndDate().isBefore(promotion.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }
        Promotion savedPromotion = promotionRepository.save(promotion);
        return PromotionDTO.fromEntity(savedPromotion);
    }

    public PromotionDTO getPromotionById(Integer promotionId) {
        Optional<Promotion> promotion = promotionRepository.findById(promotionId);
        return promotion.map(PromotionDTO::fromEntity).orElse(null);
    }

    public List<PromotionDTO> getAllPromotions() {
        return promotionRepository.findAll().stream()
            .map(PromotionDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<PromotionDTO> getActivePromotions() {
        LocalDate today = LocalDate.now();
        return promotionRepository.findAll().stream()
            .filter(p -> p.getIsActive() && 
                    !today.isBefore(p.getStartDate()) && 
                    !today.isAfter(p.getEndDate()))
            .map(PromotionDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<PromotionDTO> getPromotionsByStatus(String status) {
        LocalDate today = LocalDate.now();
        return promotionRepository.findAll().stream()
            .filter(p -> {
                if (today.isBefore(p.getStartDate())) {
                    return status.equals("UPCOMING");
                } else if (today.isAfter(p.getEndDate())) {
                    return status.equals("EXPIRED");
                } else {
                    return status.equals("ACTIVE");
                }
            })
            .map(PromotionDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<Promotion> getPromotionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return promotionRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqual(startDate, endDate);
    }

    public PromotionDTO updatePromotion(Integer promotionId, Promotion promotionDetails) {
        Optional<Promotion> promotion = promotionRepository.findById(promotionId);
        if (promotion.isPresent()) {
            if (promotionDetails.getEndDate().isBefore(promotionDetails.getStartDate())) {
                throw new RuntimeException("End date must be after start date");
            }
            
            Promotion existingPromotion = promotion.get();
            existingPromotion.setPromotionName(promotionDetails.getPromotionName());
            existingPromotion.setDescription(promotionDetails.getDescription());
            existingPromotion.setDiscountPercentage(promotionDetails.getDiscountPercentage());
            existingPromotion.setDiscountAmount(promotionDetails.getDiscountAmount());
            existingPromotion.setStartDate(promotionDetails.getStartDate());
            existingPromotion.setEndDate(promotionDetails.getEndDate());
            existingPromotion.setApplicableProducts(promotionDetails.getApplicableProducts());
            existingPromotion.setIsActive(promotionDetails.getIsActive());
            
            Promotion updatedPromotion = promotionRepository.save(existingPromotion);
            return PromotionDTO.fromEntity(updatedPromotion);
        }
        return null;
    }

    public boolean deletePromotion(Integer promotionId) {
        if (promotionRepository.existsById(promotionId)) {
            promotionRepository.deleteById(promotionId);
            return true;
        }
        return false;
    }

    public PromotionDTO togglePromotionStatus(Integer promotionId) {
        Optional<Promotion> promotion = promotionRepository.findById(promotionId);
        if (promotion.isPresent()) {
            Promotion existingPromotion = promotion.get();
            existingPromotion.setIsActive(!existingPromotion.getIsActive());
            Promotion updatedPromotion = promotionRepository.save(existingPromotion);
            return PromotionDTO.fromEntity(updatedPromotion);
        }
        return null;
    }
}
