package com.jalalert.service;

import com.jalalert.dto.*;
import com.jalalert.entity.*;
import com.jalalert.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final DepartmentRepository departmentRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final AICategorizationService aiCategorizationService;
    private final EmergencyDetectionService emergencyDetectionService;
    private final GeocodingService geocodingService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public Complaint saveComplaint(ComplaintRequestDTO request) {
        return saveComplaint(request, null);
    }

    @Transactional
    public Complaint saveComplaint(ComplaintRequestDTO request, Long userId) {
        String category = (request.getCategory() != null && !request.getCategory().isBlank())
                ? request.getCategory()
                : aiCategorizationService.categorize(request.getTitle(), request.getDescription());

        Priority priority = emergencyDetectionService.detectPriority(request.getTitle(), request.getDescription());

        String department = assignDepartment(category);

        Double latitude = request.getLatitude();
        Double longitude = request.getLongitude();

        if ((latitude == null || longitude == null) &&
            (request.getLatitude() == null && request.getLongitude() == null)) {
            String address = request.getTitle() + " " + request.getDescription();
            try {
                double[] coords = geocodingService.geocode(address);
                latitude = coords[0];
                longitude = coords[1];
            } catch (Exception e) {
                log.warn("Geocoding failed, using 0.0, 0.0: {}", e.getMessage());
                latitude = 0.0;
                longitude = 0.0;
            }
        }

        Complaint complaint = Complaint.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .latitude(latitude)
                .longitude(longitude)
                .status("SUBMITTED")
                .priority(priority)
                .assignedDepartment(department)
                .userId(userId)
                .build();

        Complaint saved = complaintRepository.save(complaint);

        StatusHistory history = StatusHistory.builder()
                .complaint(saved)
                .status("SUBMITTED")
                .notes("Complaint submitted")
                .build();
        statusHistoryRepository.save(history);

        log.info("Complaint saved: id={}, category={}, priority={}, department={}",
                saved.getId(), category, priority, department);

        if (priority == Priority.URGENT) {
            emailService.sendUrgentAlert(saved);
        }

        return saved;
    }

    public String assignDepartment(String category) {
        if (category == null) return "General";
        return departmentRepository.findByCategory(category)
                .map(Department::getName)
                .orElseGet(() -> {
                    log.warn("No department found for category '{}', assigning General", category);
                    return "General";
                });
    }

    public List<ComplaintResponseDTO> findAll() {
        return complaintRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponseDTO> findByUserId(Long userId) {
        return complaintRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public ComplaintResponseDTO findById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));
        return toResponseDTO(complaint);
    }

    @Transactional
    public ComplaintResponseDTO updateStatus(Long id, StatusUpdateDTO statusUpdate) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        complaint.setStatus(statusUpdate.getStatus());
        complaintRepository.save(complaint);

        StatusHistory history = StatusHistory.builder()
                .complaint(complaint)
                .status(statusUpdate.getStatus())
                .notes(statusUpdate.getNotes())
                .build();
        statusHistoryRepository.save(history);

        notificationService.sendStatusUpdate(id, statusUpdate.getStatus(), statusUpdate.getNotes());

        log.info("Complaint {} status updated to {}", id, statusUpdate.getStatus());

        return toResponseDTO(complaint);
    }

    public List<StatusHistoryDTO> getStatusTimeline(Long complaintId) {
        complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + complaintId));

        return statusHistoryRepository.findByComplaintIdOrderByChangedAtAsc(complaintId)
                .stream()
                .map(sh -> StatusHistoryDTO.builder()
                        .status(sh.getStatus())
                        .notes(sh.getNotes())
                        .changedAt(sh.getChangedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponseDTO adminUpdate(Long id, String department, String priority, String remarks, MultipartFile afterImage) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + id));

        if (department != null && !department.isBlank()) {
            complaint.setAssignedDepartment(department);
        }
        if (priority != null && !priority.isBlank()) {
            complaint.setPriority(Priority.valueOf(priority));
        }
        if (remarks != null && !remarks.isBlank()) {
            complaint.setRemarks(remarks);
        }
        if (afterImage != null && !afterImage.isEmpty()) {
            try {
                String fileName = "after_" + id + "_" + System.currentTimeMillis() + "_" + afterImage.getOriginalFilename();
                Path path = Paths.get(uploadDir).resolve(fileName);
                Files.createDirectories(path.getParent());
                afterImage.transferTo(path.toFile());
                complaint.setAfterFilePath("/uploads/" + fileName);
            } catch (IOException e) {
                log.warn("Failed to save after image: {}", e.getMessage());
            }
        }

        complaintRepository.save(complaint);
        return toResponseDTO(complaint);
    }

    public AnalyticsDTO getAnalytics() {
        List<Complaint> all = complaintRepository.findAll();

        Map<String, Long> countByCategory = all.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCategory() != null ? c.getCategory() : "Uncategorized",
                        Collectors.counting()));

        Map<String, Long> countByStatus = all.stream()
                .collect(Collectors.groupingBy(Complaint::getStatus, Collectors.counting()));

        long urgentCount = all.stream()
                .filter(c -> c.getPriority() == Priority.URGENT)
                .count();

        return AnalyticsDTO.builder()
                .totalComplaints(all.size())
                .countByCategory(countByCategory)
                .countByStatus(countByStatus)
                .urgentCount(urgentCount)
                .build();
    }

    private ComplaintResponseDTO toResponseDTO(Complaint complaint) {
        List<StatusHistoryDTO> timeline = statusHistoryRepository
                .findByComplaintIdOrderByChangedAtAsc(complaint.getId())
                .stream()
                .map(sh -> StatusHistoryDTO.builder()
                        .status(sh.getStatus())
                        .notes(sh.getNotes())
                        .changedAt(sh.getChangedAt())
                        .build())
                .collect(Collectors.toList());

        return ComplaintResponseDTO.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .latitude(complaint.getLatitude())
                .longitude(complaint.getLongitude())
                .filePath(complaint.getFilePath())
                .status(complaint.getStatus())
                .priority(complaint.getPriority())
                .assignedDepartment(complaint.getAssignedDepartment())
                .userId(complaint.getUserId())
                .afterFilePath(complaint.getAfterFilePath())
                .remarks(complaint.getRemarks())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .statusHistory(timeline)
                .build();
    }
}
