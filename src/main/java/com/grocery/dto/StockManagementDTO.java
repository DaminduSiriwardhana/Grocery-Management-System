package com.grocery.dto;

import com.grocery.model.StockManagement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockManagementDTO {
    private Integer stockId;
    private Integer productId;
    private String productName;
    private String warehouseLocation;
    private Integer quantityAvailable;
    private Integer reorderLevel;
    private LocalDateTime lastRestocked;
    private String stockStatus;
    private Double stockValue;

    public static StockManagementDTO fromEntity(StockManagement stock) {
        StockManagementDTO dto = new StockManagementDTO();
        dto.setStockId(stock.getStockId());
        dto.setProductId(stock.getProduct().getProductId());
        dto.setProductName(stock.getProduct().getProductName());
        dto.setWarehouseLocation(stock.getWarehouseLocation());
        dto.setQuantityAvailable(stock.getQuantityAvailable());
        dto.setReorderLevel(stock.getReorderLevel());
        dto.setLastRestocked(stock.getLastRestocked());
        
        // Determine stock status
        if (stock.getQuantityAvailable() <= 0) {
            dto.setStockStatus("OUT_OF_STOCK");
        } else if (stock.getQuantityAvailable() <= stock.getReorderLevel()) {
            dto.setStockStatus("LOW_STOCK");
        } else {
            dto.setStockStatus("IN_STOCK");
        }
        
        // Calculate stock value
        dto.setStockValue(stock.getProduct().getPrice().doubleValue() * stock.getQuantityAvailable());
        
        return dto;
    }
}
