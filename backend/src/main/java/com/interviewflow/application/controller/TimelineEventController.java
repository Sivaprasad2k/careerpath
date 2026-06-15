package com.interviewflow.application.controller;

import com.interviewflow.application.entity.TimelineEvent;
import com.interviewflow.application.service.TimelineEventService;
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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Timeline Events", description = "Query opportunity status history logs")
public class TimelineEventController {

    private final TimelineEventService service;

    @GetMapping("/opportunities/{id}/timeline")
    @Operation(summary = "Get the timeline history for an opportunity")
    public ResponseEntity<ApiResponse<List<TimelineEvent>>> getTimeline(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<TimelineEvent> timeline = service.getEvents(id, userId);
        return ResponseEntity.ok(ApiResponse.success(timeline));
    }

    @GetMapping("/timeline")
    @Operation(summary = "Get the global timeline history for the active user")
    public ResponseEntity<ApiResponse<List<TimelineEvent>>> getGlobalTimeline() {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<TimelineEvent> timeline = service.getGlobalEvents(userId);
        return ResponseEntity.ok(ApiResponse.success(timeline));
    }
}

