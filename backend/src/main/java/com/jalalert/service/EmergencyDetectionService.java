package com.jalalert.service;

import com.jalalert.entity.Priority;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class EmergencyDetectionService {

    private static final List<String> EMERGENCY_KEYWORDS = List.of(
            "gas leak", "fire", "collapsed", "sewage overflow",
            "explosion", "flood", "electrocution", "chemical spill",
            "building collapse", "landslide", "emergency"
    );

    public boolean isEmergency(String text) {
        if (text == null) return false;
        String lower = text.toLowerCase();
        for (String keyword : EMERGENCY_KEYWORDS) {
            if (lower.contains(keyword)) {
                log.warn("Emergency detected: keyword='{}'", keyword);
                return true;
            }
        }
        return false;
    }

    public Priority detectPriority(String title, String description) {
        if (isEmergency(title)) return Priority.URGENT;
        if (isEmergency(description)) return Priority.URGENT;
        return Priority.NORMAL;
    }
}
