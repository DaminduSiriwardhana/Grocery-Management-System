package com.grocery.controller;

import com.grocery.dto.StockManagementDTO;
import com.grocery.model.StockManagement;
import com.grocery.service.StockManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/stock")
@CrossOrigin(origins = "*")
public class StockManagementController {
    @Autowired
    private StockManagementService stockManagementService;

    @PostMapping
    public ResponseEntity<StockManagementDTO> createStock(@RequestBody StockManagement stock) {
        StockManagementDTO createdStock = stockManagementService.createStock(stock);
        return new ResponseEntity<>(createdStock, HttpStatus.CREATED);
    }

    @GetMapping("/{stockId}")
    public ResponseEntity<StockManagementDTO> getStockById(@PathVariable Integer stockId) {
        StockManagementDTO stock = stockManagementService.getStockById(stockId);
        if (stock != null) {
            return new ResponseEntity<>(stock, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<StockManagementDTO> getStockByProductId(@PathVariable Integer productId) {
        StockManagementDTO stock = stockManagementService.getStockByProductId(productId);
        if (stock != null) {
            return new ResponseEntity<>(stock, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping
    public ResponseEntity<List<StockManagementDTO>> getAllStocks() {
        List<StockManagementDTO> stocks = stockManagementService.getAllStocks();
        return new ResponseEntity<>(stocks, HttpStatus.OK);
    }

    @GetMapping("/alerts/low-stock")
    public ResponseEntity<List<StockManagementDTO>> getLowStockItems() {
        List<StockManagementDTO> stocks = stockManagementService.getLowStockItems();
        return new ResponseEntity<>(stocks, HttpStatus.OK);
    }

    @GetMapping("/alerts/out-of-stock")
    public ResponseEntity<List<StockManagementDTO>> getOutOfStockItems() {
        List<StockManagementDTO> stocks = stockManagementService.getOutOfStockItems();
        return new ResponseEntity<>(stocks, HttpStatus.OK);
    }

    @PutMapping("/{stockId}")
    public ResponseEntity<StockManagementDTO> updateStock(@PathVariable Integer stockId, @RequestBody StockManagement stockDetails) {
        try {
            StockManagementDTO updatedStock = stockManagementService.updateStock(stockId, stockDetails);
            if (updatedStock != null) {
                return new ResponseEntity<>(updatedStock, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{stockId}/restock")
    public ResponseEntity<StockManagementDTO> restockItem(@PathVariable Integer stockId, @RequestParam Integer quantity) {
        try {
            StockManagementDTO updatedStock = stockManagementService.restockItem(stockId, quantity);
            if (updatedStock != null) {
                return new ResponseEntity<>(updatedStock, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{stockId}/adjust")
    public ResponseEntity<StockManagementDTO> adjustStock(@PathVariable Integer stockId, @RequestParam Integer quantity) {
        try {
            StockManagementDTO updatedStock = stockManagementService.adjustStock(stockId, quantity);
            if (updatedStock != null) {
                return new ResponseEntity<>(updatedStock, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/analytics/total-value")
    public ResponseEntity<Double> getTotalInventoryValue() {
        Double totalValue = stockManagementService.getTotalInventoryValue();
        return new ResponseEntity<>(totalValue, HttpStatus.OK);
    }

    @DeleteMapping("/{stockId}")
    public ResponseEntity<Void> deleteStock(@PathVariable Integer stockId) {
        if (stockManagementService.deleteStock(stockId)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
