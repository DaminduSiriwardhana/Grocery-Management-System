package com.grocery.service;

import com.grocery.dto.StockManagementDTO;
import com.grocery.model.StockManagement;
import com.grocery.repository.StockManagementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class StockManagementService {
    @Autowired
    private StockManagementRepository stockManagementRepository;

    public StockManagementDTO createStock(StockManagement stock) {
        StockManagement savedStock = stockManagementRepository.save(stock);
        return StockManagementDTO.fromEntity(savedStock);
    }

    public StockManagementDTO getStockById(Integer stockId) {
        Optional<StockManagement> stock = stockManagementRepository.findById(stockId);
        return stock.map(StockManagementDTO::fromEntity).orElse(null);
    }

    public StockManagementDTO getStockByProductId(Integer productId) {
        Optional<StockManagement> stock = stockManagementRepository.findByProductProductId(productId);
        return stock.map(StockManagementDTO::fromEntity).orElse(null);
    }

    public List<StockManagementDTO> getAllStocks() {
        return stockManagementRepository.findAll().stream()
            .map(StockManagementDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<StockManagementDTO> getLowStockItems() {
        return stockManagementRepository.findAll().stream()
            .filter(s -> s.getQuantityAvailable() <= s.getReorderLevel())
            .map(StockManagementDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<StockManagementDTO> getOutOfStockItems() {
        return stockManagementRepository.findAll().stream()
            .filter(s -> s.getQuantityAvailable() <= 0)
            .map(StockManagementDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public StockManagementDTO updateStock(Integer stockId, StockManagement stockDetails) {
        Optional<StockManagement> stock = stockManagementRepository.findById(stockId);
        if (stock.isPresent()) {
            StockManagement existingStock = stock.get();
            existingStock.setQuantityAvailable(stockDetails.getQuantityAvailable());
            existingStock.setWarehouseLocation(stockDetails.getWarehouseLocation());
            existingStock.setReorderLevel(stockDetails.getReorderLevel());
            existingStock.setLastRestocked(LocalDateTime.now());
            StockManagement updatedStock = stockManagementRepository.save(existingStock);
            return StockManagementDTO.fromEntity(updatedStock);
        }
        return null;
    }

    public StockManagementDTO restockItem(Integer stockId, Integer quantity) {
        Optional<StockManagement> stock = stockManagementRepository.findById(stockId);
        if (stock.isPresent()) {
            StockManagement existingStock = stock.get();
            existingStock.setQuantityAvailable(existingStock.getQuantityAvailable() + quantity);
            existingStock.setLastRestocked(LocalDateTime.now());
            StockManagement updatedStock = stockManagementRepository.save(existingStock);
            return StockManagementDTO.fromEntity(updatedStock);
        }
        return null;
    }

    public StockManagementDTO adjustStock(Integer stockId, Integer quantity) {
        Optional<StockManagement> stock = stockManagementRepository.findById(stockId);
        if (stock.isPresent()) {
            StockManagement existingStock = stock.get();
            int newQuantity = existingStock.getQuantityAvailable() + quantity;
            if (newQuantity < 0) {
                throw new RuntimeException("Cannot reduce stock below zero");
            }
            existingStock.setQuantityAvailable(newQuantity);
            existingStock.setLastRestocked(LocalDateTime.now());
            StockManagement updatedStock = stockManagementRepository.save(existingStock);
            return StockManagementDTO.fromEntity(updatedStock);
        }
        return null;
    }

    public boolean deleteStock(Integer stockId) {
        if (stockManagementRepository.existsById(stockId)) {
            stockManagementRepository.deleteById(stockId);
            return true;
        }
        return false;
    }

    public Double getTotalInventoryValue() {
        return stockManagementRepository.findAll().stream()
            .mapToDouble(s -> s.getProduct().getPrice().doubleValue() * s.getQuantityAvailable())
            .sum();
    }
}
