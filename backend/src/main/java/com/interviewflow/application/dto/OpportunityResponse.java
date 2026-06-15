package com.interviewflow.application.dto;

import com.interviewflow.application.entity.OpportunityStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

public record OpportunityResponse(
        UUID id,
        String companyName,
        String roleName,
        String location,
        String source,
        String salary,
        String priority,
        LocalDate applicationDate,
        OpportunityStatus currentStatus,
        Set<OpportunityStatus> allowedTransitions,
        Instant createdAt,
        Instant updatedAt
) {}
