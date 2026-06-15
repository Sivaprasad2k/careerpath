package com.interviewflow.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateOpportunityRequest(
        @NotBlank(message = "Company name is required")
        @Size(max = 255, message = "Company name must not exceed 255 characters")
        String companyName,

        @NotBlank(message = "Role name is required")
        @Size(max = 255, message = "Role name must not exceed 255 characters")
        String roleName,

        @Size(max = 255, message = "Location must not exceed 255 characters")
        String location,

        @Size(max = 1000, message = "Source must not exceed 1000 characters")
        String source,

        @Size(max = 100, message = "Salary must not exceed 100 characters")
        String salary,

        @Size(max = 50, message = "Priority must not exceed 50 characters")
        String priority,

        @Size(max = 5000, message = "Notes must not exceed 5000 characters")
        String notes,

        LocalDate applicationDate
) {}

