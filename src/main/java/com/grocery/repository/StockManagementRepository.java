package com.grocery.repository;

import com.grocery.model.StockManagement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StockManagementRepository extends JpaRepository<StockManagement, Integer> {
    Optional<StockManagement> findByProductProductId(Integer productId);
}
