package com.jalalert.controller;

import com.jalalert.dto.*;
import com.jalalert.entity.Complaint;
import com.jalalert.entity.User;
import com.jalalert.repository.UserRepository;
import com.jalalert.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintRestController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ComplaintResponseDTO> createComplaint(
            @Valid @RequestBody ComplaintRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByEmail(userDetails.getUsername()).map(User::getId).orElse(null);
        }
        Complaint complaint = complaintService.saveComplaint(request, userId);
        ComplaintResponseDTO response = complaintService.findById(complaint.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponseDTO>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.findAll());
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponseDTO>> getMyComplaints(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(complaintService.findByUserId(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponseDTO> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.findById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ComplaintResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO statusUpdate) {
        return ResponseEntity.ok(complaintService.updateStatus(id, statusUpdate));
    }

    @PutMapping("/{id}/admin")
    public ResponseEntity<ComplaintResponseDTO> adminUpdate(
            @PathVariable Long id,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String remarks,
            @RequestParam(required = false) MultipartFile afterImage) {
        return ResponseEntity.ok(complaintService.adminUpdate(id, department, priority, remarks, afterImage));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<StatusHistoryDTO>> getTimeline(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getStatusTimeline(id));
    }
}
