package com.grocery.controller;

import com.grocery.dto.PromotionDTO;
import com.grocery.model.Promotion;
import com.grocery.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {
    @Autowired
    private PromotionService promotionService;

    @PostMapping
    public ResponseEntity<PromotionDTO> createPromotion(@RequestBody Promotion promotion) {
        try {
            PromotionDTO createdPromotion = promotionService.createPromotion(promotion);
            return new ResponseEntity<>(createdPromotion, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{promotionId}")
    public ResponseEntity<PromotionDTO> getPromotionById(@PathVariable Integer promotionId) {
        PromotionDTO promotion = promotionService.getPromotionById(promotionId);
        if (promotion != null) {
            return new ResponseEntity<>(promotion, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping
    public ResponseEntity<List<PromotionDTO>> getAllPromotions() {
        List<PromotionDTO> promotions = promotionService.getAllPromotions();
        return new ResponseEntity<>(promotions, HttpStatus.OK);
    }

    @GetMapping("/active")
    public ResponseEntity<List<PromotionDTO>> getActivePromotions() {
        List<PromotionDTO> promotions = promotionService.getActivePromotions();
        return new ResponseEntity<>(promotions, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PromotionDTO>> getPromotionsByStatus(@PathVariable String status) {
        List<PromotionDTO> promotions = promotionService.getPromotionsByStatus(status);
        return new ResponseEntity<>(promotions, HttpStatus.OK);
    }

    @PutMapping("/{promotionId}")
    public ResponseEntity<PromotionDTO> updatePromotion(@PathVariable Integer promotionId, @RequestBody Promotion promotionDetails) {
        try {
            PromotionDTO updatedPromotion = promotionService.updatePromotion(promotionId, promotionDetails);
            if (updatedPromotion != null) {
                return new ResponseEntity<>(updatedPromotion, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{promotionId}/toggle")
    public ResponseEntity<PromotionDTO> togglePromotionStatus(@PathVariable Integer promotionId) {
        PromotionDTO updatedPromotion = promotionService.togglePromotionStatus(promotionId);
        if (updatedPromotion != null) {
            return new ResponseEntity<>(updatedPromotion, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{promotionId}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Integer promotionId) {
        if (promotionService.deletePromotion(promotionId)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
