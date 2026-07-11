package com.jalalert.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendStatusUpdate(Long complaintId, String newStatus, String notes) {
        Map<String, Object> payload = Map.of(
                "complaintId", complaintId,
                "status", newStatus,
                "notes", notes != null ? notes : ""
        );
        messagingTemplate.convertAndSend("/topic/status", payload);
        log.info("Push notification sent for complaint #{}: status={}", complaintId, newStatus);
    }
}
