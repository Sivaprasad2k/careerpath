package com.interviewflow.analytics.controller;

import com.interviewflow.analytics.dto.AnalyticsResponse;
import com.interviewflow.analytics.service.AnalyticsService;
import com.interviewflow.common.response.ApiResponse;
import com.interviewflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Query job search rates and performance metrics")
public class AnalyticsController {

    private final AnalyticsService service;

    @GetMapping("/dashboard")
    @Operation(summary = "Get user analytics stats for dashboard metrics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getDashboardStats() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.getDashboardStats(userId)));
    }
}
