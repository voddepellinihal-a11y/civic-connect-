package com.jalalert.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDTO {

    private long totalComplaints;
    private Map<String, Long> countByCategory;
    private Map<String, Long> countByStatus;
    private long urgentCount;
}
