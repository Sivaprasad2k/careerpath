package com.interviewflow.application.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateOpportunityRequest(
        @Size(max = 255, message = "Company name must not exceed 255 characters")
        String companyName,

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

        LocalDate applicationDate
) {}

