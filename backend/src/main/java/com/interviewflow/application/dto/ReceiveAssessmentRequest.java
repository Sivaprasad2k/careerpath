package com.interviewflow.application.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record ReceiveAssessmentRequest(
        @NotNull(message = "Assessment deadline date is required")
        Instant deadlineDate
) {}

