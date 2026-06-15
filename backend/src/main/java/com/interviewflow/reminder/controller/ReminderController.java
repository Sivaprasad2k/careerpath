package com.interviewflow.reminder.controller;

import com.interviewflow.reminder.entity.Reminder;
import com.interviewflow.reminder.service.ReminderService;
import com.interviewflow.common.response.ApiResponse;
import com.interviewflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reminders")
@RequiredArgsConstructor
@Tag(name = "Reminders", description = "Query and dismiss follow-up and task reminders")
public class ReminderController {

    private final ReminderService service;

    @GetMapping
    @Operation(summary = "Get all active (undismissed) reminders for the user")
    public ResponseEntity<ApiResponse<List<Reminder>>> getActiveReminders() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.listActiveReminders(userId)));
    }

    @PutMapping("/{id}/dismiss")
    @Operation(summary = "Dismiss an active reminder")
    public ResponseEntity<ApiResponse<Reminder>> dismissReminder(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.dismiss(id, userId)));
    }
}
