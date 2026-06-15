package com.interviewflow.application.controller;

import com.interviewflow.application.dto.*;
import com.interviewflow.application.service.OpportunityService;
import com.interviewflow.common.response.ApiResponse;
import com.interviewflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/opportunities")
@RequiredArgsConstructor
@Tag(name = "Opportunities", description = "Manage candidate job search opportunities and transitions")
public class OpportunityController {

    private final OpportunityService service;

    @PostMapping
    @Operation(summary = "Create a new opportunity in DRAFT state")
    public ResponseEntity<ApiResponse<OpportunityResponse>> create(
            @Valid @RequestBody CreateOpportunityRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        OpportunityResponse response = service.create(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "List all opportunities for the authenticated user (paginated)")
    public ResponseEntity<ApiResponse<Page<OpportunitySummaryResponse>>> list(
            @PageableDefault(size = 20, sort = "updatedAt") Pageable pageable) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Page<OpportunitySummaryResponse> page = service.listByUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single opportunity details and valid transitions")
    public ResponseEntity<ApiResponse<OpportunityResponse>> getById(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        OpportunityResponse response = service.getById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update non-workflow fields of an opportunity")
    public ResponseEntity<ApiResponse<OpportunityResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOpportunityRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.update(id, request, userId)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an opportunity")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        service.delete(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Opportunity deleted"));
    }

    // ─── WORKFLOW TRANSITIONS ────────────────────────────────────────────────────

    @PostMapping("/{id}/apply")
    @Operation(summary = "Transition: DRAFT → APPLIED")
    public ResponseEntity<ApiResponse<OpportunityResponse>> apply(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.apply(id, userId)));
    }

    @PostMapping("/{id}/receive-assessment")
    @Operation(summary = "Transition: APPLIED → ASSESSMENT_RECEIVED")
    public ResponseEntity<ApiResponse<OpportunityResponse>> receiveAssessment(
            @PathVariable UUID id,
            @Valid @RequestBody ReceiveAssessmentRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.receiveAssessment(id, request, userId)));
    }

    @PostMapping("/{id}/complete-assessment")
    @Operation(summary = "Transition: ASSESSMENT_RECEIVED → ASSESSMENT_COMPLETED")
    public ResponseEntity<ApiResponse<OpportunityResponse>> completeAssessment(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.completeAssessment(id, userId)));
    }

    @PostMapping("/{id}/schedule-interview")
    @Operation(summary = "Transition: ASSESSMENT_COMPLETED/APPLIED/etc. → INTERVIEW_SCHEDULED")
    public ResponseEntity<ApiResponse<OpportunityResponse>> scheduleInterview(
            @PathVariable UUID id,
            @Valid @RequestBody ScheduleInterviewRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.scheduleInterview(id, request, userId)));
    }

    @PostMapping("/{id}/complete-interview")
    @Operation(summary = "Transition: INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED")
    public ResponseEntity<ApiResponse<OpportunityResponse>> completeInterview(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.completeInterview(id, userId)));
    }

    @PostMapping("/{id}/receive-offer")
    @Operation(summary = "Transition: INTERVIEW_COMPLETED/etc. → OFFER_RECEIVED")
    public ResponseEntity<ApiResponse<OpportunityResponse>> receiveOffer(
            @PathVariable UUID id,
            @Valid @RequestBody ReceiveOfferRequest request) {

        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.receiveOffer(id, request, userId)));
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Transition: OFFER_RECEIVED → ACCEPTED")
    public ResponseEntity<ApiResponse<OpportunityResponse>> acceptOffer(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.acceptOffer(id, userId)));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Transition: Any active → REJECTED")
    public ResponseEntity<ApiResponse<OpportunityResponse>> reject(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.reject(id, userId)));
    }

    @PostMapping("/{id}/decline")
    @Operation(summary = "Transition: OFFER_RECEIVED → DECLINED")
    public ResponseEntity<ApiResponse<OpportunityResponse>> declineOffer(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.declineOffer(id, userId)));
    }

    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Transition: Any non-terminal → WITHDRAWN")
    public ResponseEntity<ApiResponse<OpportunityResponse>> withdraw(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.withdraw(id, userId)));
    }
}
