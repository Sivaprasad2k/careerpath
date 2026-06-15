package com.interviewflow.notification.controller;

import com.interviewflow.common.response.ApiResponse;
import com.interviewflow.common.security.SecurityUtils;
import com.interviewflow.notification.dto.NotificationResponse;
import com.interviewflow.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notification management")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "List notifications for the authenticated user")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> list(
            @PageableDefault(size = 20) Pageable pageable) {

        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.listForUser(userId, pageable)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count (for notification bell badge)")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount() {
        UUID userId = SecurityUtils.getCurrentUserId();
        long count = notificationService.countUnread(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.markRead(id, userId)));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        notificationService.markAllRead(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }
}
