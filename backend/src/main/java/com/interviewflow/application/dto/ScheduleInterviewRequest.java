package com.interviewflow.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record ScheduleInterviewRequest(
        @NotNull(message = "Interview scheduled date and time is required")
        Instant scheduledAt,

        String interviewerName,

        @NotBlank(message = "Platform / Meeting Link is required")
        @Size(max = 255, message = "Platform must not exceed 255 characters")
        String platform,

        Integer durationMinutes,

        @Size(max = 2000, message = "Notes must not exceed 2000 characters")
        String notes
) {}

