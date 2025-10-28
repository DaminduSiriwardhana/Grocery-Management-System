package com.grocery.dto;

import com.grocery.model.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Integer productId;
    private String productName;
    private String category;
    private BigDecimal price;
    private Integer stockQuantity;
    private String description;
    private String imageUrl;

    public static ProductDTO fromEntity(Product product) {
        return new ProductDTO(
            product.getProductId(),
            product.getProductName(),
            product.getCategory(),
            product.getPrice(),
            product.getStockQuantity(),
            product.getDescription(),
            product.getImageUrl()
        );
    }
}
