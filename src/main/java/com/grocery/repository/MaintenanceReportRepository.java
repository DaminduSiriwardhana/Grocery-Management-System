package com.grocery.repository;

import com.grocery.model.MaintenanceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceReportRepository extends JpaRepository<MaintenanceReport, Integer> {
    List<MaintenanceReport> findByStatus(MaintenanceReport.ReportStatus status);
    List<MaintenanceReport> findByReportedByUserId(Integer userId);
}
