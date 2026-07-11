package com.jalalert.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusUpdateDTO {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "SUBMITTED|IN_PROGRESS|RESOLVED|REJECTED", message = "Invalid status value")
    private String status;

    private String notes;
}
