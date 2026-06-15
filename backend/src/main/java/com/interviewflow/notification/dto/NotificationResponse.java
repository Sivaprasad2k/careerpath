package com.interviewflow.notification.dto;

import com.interviewflow.notification.entity.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        NotificationType type,
        String title,
        String message,
        boolean read,
        Instant createdAt
) {}
