package com.interviewflow.audit.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        UUID userId,
        String entityType,
        UUID entityId,
        String action,
        Map<String, Object> oldValue,
        Map<String, Object> newValue,
        Instant createdAt
) {}
