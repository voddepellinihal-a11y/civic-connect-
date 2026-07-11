package com.jalalert.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

import static java.util.Map.entry;

@Slf4j
@Service
public class AICategorizationService {

    private static final Map<String, String> KEYWORD_CATEGORY_MAP = Map.ofEntries(
            entry("road", "Transport"),
            entry("pothole", "Transport"),
            entry("traffic", "Transport"),
            entry("bus", "Transport"),
            entry("garbage", "Sanitation"),
            entry("waste", "Sanitation"),
            entry("sewage", "Sanitation"),
            entry("drain", "Sanitation"),
            entry("streetlight", "Electricity"),
            entry("power", "Electricity"),
            entry("electric", "Electricity"),
            entry("fire", "Safety"),
            entry("theft", "Safety"),
            entry("safety", "Safety"),
            entry("accident", "Safety")
    );

    public String categorize(String title, String description) {
        String text = (title + " " + description).toLowerCase();

        for (Map.Entry<String, String> entry : KEYWORD_CATEGORY_MAP.entrySet()) {
            if (text.contains(entry.getKey())) {
                log.info("AI categorization: matched '{}' -> '{}'", entry.getKey(), entry.getValue());
                return entry.getValue();
            }
        }

        log.info("AI categorization: no match found, defaulting to 'Other'");
        return "Other";
    }
}
