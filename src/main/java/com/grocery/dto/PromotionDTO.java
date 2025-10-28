package com.grocery.dto;

import com.grocery.model.Promotion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionDTO {
    private Integer promotionId;
    private String promotionName;
    private String description;
    private BigDecimal discountPercentage;
    private BigDecimal discountAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String applicableProducts;
    private Boolean isActive;
    private String status;

    public static PromotionDTO fromEntity(Promotion promotion) {
        PromotionDTO dto = new PromotionDTO();
        dto.setPromotionId(promotion.getPromotionId());
        dto.setPromotionName(promotion.getPromotionName());
        dto.setDescription(promotion.getDescription());
        dto.setDiscountPercentage(promotion.getDiscountPercentage());
        dto.setDiscountAmount(promotion.getDiscountAmount());
        dto.setStartDate(promotion.getStartDate());
        dto.setEndDate(promotion.getEndDate());
        dto.setApplicableProducts(promotion.getApplicableProducts());
        dto.setIsActive(promotion.getIsActive());
        
        LocalDate today = LocalDate.now();
        if (today.isBefore(promotion.getStartDate())) {
            dto.setStatus("UPCOMING");
        } else if (today.isAfter(promotion.getEndDate())) {
            dto.setStatus("EXPIRED");
        } else {
            dto.setStatus("ACTIVE");
        }
        
        return dto;
    }
}
