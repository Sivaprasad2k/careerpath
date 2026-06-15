package com.interviewflow.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record ReceiveOfferRequest(
        @NotBlank(message = "Salary offer package is required")
        @Size(max = 100, message = "Salary must not exceed 100 characters")
        String salary,

        Instant offerExpiryDate
) {}

