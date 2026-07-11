package com.jalalert.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusHistoryDTO {

    private String status;
    private String notes;
    private LocalDateTime changedAt;
}
