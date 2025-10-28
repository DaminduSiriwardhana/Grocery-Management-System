package com.grocery.dto;

import com.grocery.model.MaintenanceReport;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceReportDTO {
    private Integer reportId;
    private Integer reportedByUserId;
    private String reportedByUsername;
    private String reportType;
    private String description;
    private String status;
    private String priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long daysOpen;

    public static MaintenanceReportDTO fromEntity(MaintenanceReport report) {
        MaintenanceReportDTO dto = new MaintenanceReportDTO();
        dto.setReportId(report.getReportId());
        dto.setReportedByUserId(report.getReportedBy().getUserId());
        dto.setReportedByUsername(report.getReportedBy().getUsername());
        dto.setReportType(report.getReportType());
        dto.setDescription(report.getDescription());
        dto.setStatus(report.getStatus().toString());
        dto.setPriority(report.getPriority().toString());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());
        
        // Calculate days open
        long daysOpen = java.time.temporal.ChronoUnit.DAYS.between(
            report.getCreatedAt().toLocalDate(),
            LocalDateTime.now().toLocalDate()
        );
        dto.setDaysOpen(daysOpen);
        
        return dto;
    }
}
