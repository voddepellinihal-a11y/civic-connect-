package com.jalalert.controller;

import com.jalalert.dto.AnalyticsDTO;
import com.jalalert.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsRestController {

    private final ComplaintService complaintService;

    @GetMapping("/dashboard")
    public ResponseEntity<AnalyticsDTO> getDashboard() {
        return ResponseEntity.ok(complaintService.getAnalytics());
    }
}
