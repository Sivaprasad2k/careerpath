package com.interviewflow.calendar.controller;

import com.interviewflow.calendar.entity.CalendarEvent;
import com.interviewflow.calendar.service.CalendarEventService;
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
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
@Tag(name = "Calendar", description = "Query calendar events for active opportunities")
public class CalendarEventController {

    private final CalendarEventService service;

    @GetMapping("/events")
    @Operation(summary = "Get all calendar events for the user")
    public ResponseEntity<ApiResponse<List<CalendarEvent>>> getEvents() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.listEvents(userId)));
    }

    @GetMapping("/opportunities/{opportunityId}")
    @Operation(summary = "Get all calendar events for a specific opportunity")
    public ResponseEntity<ApiResponse<List<CalendarEvent>>> getEventsForOpportunity(@PathVariable UUID opportunityId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.listEventsForOpportunity(opportunityId, userId)));
    }
}
