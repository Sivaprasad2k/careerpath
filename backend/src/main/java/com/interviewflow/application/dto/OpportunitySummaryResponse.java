package com.interviewflow.application.dto;

import com.interviewflow.application.entity.OpportunityStatus;

import java.time.Instant;
import java.util.UUID;

public record OpportunitySummaryResponse(
        UUID id,
        String companyName,
        String roleName,
        String location,
        String priority,
        OpportunityStatus currentStatus,
        Instant updatedAt
) {}
