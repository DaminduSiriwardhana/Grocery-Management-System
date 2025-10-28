package com.grocery.service;

import com.grocery.dto.ProductDTO;
import com.grocery.model.Product;
import com.grocery.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public ProductDTO createProduct(Product product) {
        Product savedProduct = productRepository.save(product);
        return ProductDTO.fromEntity(savedProduct);
    }

    public ProductDTO getProductById(Integer productId) {
        Optional<Product> product = productRepository.findById(productId);
        return product.map(ProductDTO::fromEntity).orElse(null);
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
            .map(ProductDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<ProductDTO> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
            .map(ProductDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<ProductDTO> searchProducts(String keyword) {
        return productRepository.findByProductNameContainingIgnoreCase(keyword).stream()
            .map(ProductDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public ProductDTO updateProduct(Integer productId, Product productDetails) {
        Optional<Product> product = productRepository.findById(productId);
        if (product.isPresent()) {
            Product existingProduct = product.get();
            existingProduct.setProductName(productDetails.getProductName());
            existingProduct.setCategory(productDetails.getCategory());
            existingProduct.setPrice(productDetails.getPrice());
            existingProduct.setStockQuantity(productDetails.getStockQuantity());
            existingProduct.setDescription(productDetails.getDescription());
            existingProduct.setImageUrl(productDetails.getImageUrl());
            Product updatedProduct = productRepository.save(existingProduct);
            return ProductDTO.fromEntity(updatedProduct);
        }
        return null;
    }

    public boolean deleteProduct(Integer productId) {
        if (productRepository.existsById(productId)) {
            productRepository.deleteById(productId);
            return true;
        }
        return false;
    }
}
