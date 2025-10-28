package com.grocery.controller;

import com.grocery.dto.MaintenanceReportDTO;
import com.grocery.model.MaintenanceReport;
import com.grocery.service.MaintenanceReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceReportController {
    @Autowired
    private MaintenanceReportService maintenanceReportService;

    @PostMapping
    public ResponseEntity<MaintenanceReportDTO> createReport(@RequestBody MaintenanceReport report) {
        MaintenanceReportDTO createdReport = maintenanceReportService.createReport(report);
        return new ResponseEntity<>(createdReport, HttpStatus.CREATED);
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<MaintenanceReportDTO> getReportById(@PathVariable Integer reportId) {
        MaintenanceReportDTO report = maintenanceReportService.getReportById(reportId);
        if (report != null) {
            return new ResponseEntity<>(report, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceReportDTO>> getAllReports() {
        List<MaintenanceReportDTO> reports = maintenanceReportService.getAllReports();
        return new ResponseEntity<>(reports, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<MaintenanceReportDTO>> getReportsByStatus(@PathVariable String status) {
        try {
            List<MaintenanceReportDTO> reports = maintenanceReportService.getReportsByStatus(MaintenanceReport.ReportStatus.valueOf(status));
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<MaintenanceReportDTO>> getReportsByPriority(@PathVariable String priority) {
        try {
            List<MaintenanceReportDTO> reports = maintenanceReportService.getReportsByPriority(MaintenanceReport.Priority.valueOf(priority));
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/critical")
    public ResponseEntity<List<MaintenanceReportDTO>> getCriticalReports() {
        List<MaintenanceReportDTO> reports = maintenanceReportService.getCriticalReports();
        return new ResponseEntity<>(reports, HttpStatus.OK);
    }

    @GetMapping("/analytics/statistics")
    public ResponseEntity<Map<String, Long>> getReportStatistics() {
        Map<String, Long> stats = maintenanceReportService.getReportStatistics();
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }

    @PutMapping("/{reportId}")
    public ResponseEntity<MaintenanceReportDTO> updateReport(@PathVariable Integer reportId, @RequestBody MaintenanceReport reportDetails) {
        MaintenanceReportDTO updatedReport = maintenanceReportService.updateReport(reportId, reportDetails);
        if (updatedReport != null) {
            return new ResponseEntity<>(updatedReport, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{reportId}/status")
    public ResponseEntity<MaintenanceReportDTO> updateReportStatus(@PathVariable Integer reportId, @RequestParam String status) {
        try {
            MaintenanceReportDTO updatedReport = maintenanceReportService.updateReportStatus(reportId, MaintenanceReport.ReportStatus.valueOf(status));
            if (updatedReport != null) {
                return new ResponseEntity<>(updatedReport, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<Void> deleteReport(@PathVariable Integer reportId) {
        if (maintenanceReportService.deleteReport(reportId)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
