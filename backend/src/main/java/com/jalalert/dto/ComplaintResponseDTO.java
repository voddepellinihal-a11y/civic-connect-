package com.jalalert.dto;

import com.jalalert.entity.Priority;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponseDTO {

    private Long id;
    private String title;
    private String description;
    private String category;
    private Double latitude;
    private Double longitude;
    private String filePath;
    private String status;
    private Priority priority;
    private String assignedDepartment;
    private Long userId;
    private String afterFilePath;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StatusHistoryDTO> statusHistory;
}
