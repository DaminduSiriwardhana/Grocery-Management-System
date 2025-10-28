package com.grocery.service;

import com.grocery.dto.MaintenanceReportDTO;
import com.grocery.model.MaintenanceReport;
import com.grocery.repository.MaintenanceReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class MaintenanceReportService {
    @Autowired
    private MaintenanceReportRepository maintenanceReportRepository;

    public MaintenanceReportDTO createReport(MaintenanceReport report) {
        MaintenanceReport savedReport = maintenanceReportRepository.save(report);
        return MaintenanceReportDTO.fromEntity(savedReport);
    }

    public MaintenanceReportDTO getReportById(Integer reportId) {
        Optional<MaintenanceReport> report = maintenanceReportRepository.findById(reportId);
        return report.map(MaintenanceReportDTO::fromEntity).orElse(null);
    }

    public List<MaintenanceReportDTO> getAllReports() {
        return maintenanceReportRepository.findAll().stream()
            .map(MaintenanceReportDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<MaintenanceReportDTO> getReportsByStatus(MaintenanceReport.ReportStatus status) {
        return maintenanceReportRepository.findByStatus(status).stream()
            .map(MaintenanceReportDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<MaintenanceReportDTO> getReportsByPriority(MaintenanceReport.Priority priority) {
        return maintenanceReportRepository.findAll().stream()
            .filter(r -> r.getPriority() == priority)
            .map(MaintenanceReportDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public List<MaintenanceReportDTO> getReportsByUserId(Integer userId) {
        return maintenanceReportRepository.findByReportedByUserId(userId).stream()
            .map(MaintenanceReportDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public MaintenanceReportDTO updateReport(Integer reportId, MaintenanceReport reportDetails) {
        Optional<MaintenanceReport> report = maintenanceReportRepository.findById(reportId);
        if (report.isPresent()) {
            MaintenanceReport existingReport = report.get();
            existingReport.setReportType(reportDetails.getReportType());
            existingReport.setDescription(reportDetails.getDescription());
            existingReport.setStatus(reportDetails.getStatus());
            existingReport.setPriority(reportDetails.getPriority());
            MaintenanceReport updatedReport = maintenanceReportRepository.save(existingReport);
            return MaintenanceReportDTO.fromEntity(updatedReport);
        }
        return null;
    }

    public MaintenanceReportDTO updateReportStatus(Integer reportId, MaintenanceReport.ReportStatus status) {
        Optional<MaintenanceReport> report = maintenanceReportRepository.findById(reportId);
        if (report.isPresent()) {
            MaintenanceReport existingReport = report.get();
            existingReport.setStatus(status);
            MaintenanceReport updatedReport = maintenanceReportRepository.save(existingReport);
            return MaintenanceReportDTO.fromEntity(updatedReport);
        }
        return null;
    }

    public List<MaintenanceReportDTO> getCriticalReports() {
        return maintenanceReportRepository.findAll().stream()
            .filter(r -> r.getPriority() == MaintenanceReport.Priority.CRITICAL &&
                    (r.getStatus() == MaintenanceReport.ReportStatus.OPEN ||
                     r.getStatus() == MaintenanceReport.ReportStatus.IN_PROGRESS))
            .map(MaintenanceReportDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public java.util.Map<String, Long> getReportStatistics() {
        List<MaintenanceReport> allReports = maintenanceReportRepository.findAll();
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        
        stats.put("TOTAL", (long) allReports.size());
        stats.put("OPEN", allReports.stream().filter(r -> r.getStatus() == MaintenanceReport.ReportStatus.OPEN).count());
        stats.put("IN_PROGRESS", allReports.stream().filter(r -> r.getStatus() == MaintenanceReport.ReportStatus.IN_PROGRESS).count());
        stats.put("RESOLVED", allReports.stream().filter(r -> r.getStatus() == MaintenanceReport.ReportStatus.RESOLVED).count());
        stats.put("CLOSED", allReports.stream().filter(r -> r.getStatus() == MaintenanceReport.ReportStatus.CLOSED).count());
        stats.put("CRITICAL", allReports.stream().filter(r -> r.getPriority() == MaintenanceReport.Priority.CRITICAL).count());
        
        return stats;
    }

    public boolean deleteReport(Integer reportId) {
        if (maintenanceReportRepository.existsById(reportId)) {
            maintenanceReportRepository.deleteById(reportId);
            return true;
        }
        return false;
    }
}
