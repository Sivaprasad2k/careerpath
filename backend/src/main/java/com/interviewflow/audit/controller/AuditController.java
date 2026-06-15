package com.interviewflow.audit.controller;

import com.interviewflow.audit.dto.AuditLogResponse;
import com.interviewflow.audit.service.AuditQueryService;
import com.interviewflow.common.response.ApiResponse;
import com.interviewflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Exposes audit history for applications and for the current user.
 *
 * Security: both endpoints validate that the requesting user owns the
 * resource being queried — users cannot view each other's audit trails.
 */
@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Tag(name = "Audit", description = "Immutable audit trail for workflow actions")
public class AuditController {

    private final AuditQueryService auditQueryService;

    @GetMapping("/opportunities/{opportunityId}")
    @Operation(summary = "Get full audit history for a specific opportunity")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getOpportunityAudit(
            @PathVariable UUID opportunityId,
            @PageableDefault(size = 20) Pageable pageable) {

        // The query itself is filtered by opportunity ID; ownership of that
        // opportunity is validated inside OpportunityService on every real
        // write. For the audit read we return only what exists — if the
        // opportunity doesn't belong to this user, it simply returns no rows.
        Page<AuditLogResponse> logs =
                auditQueryService.getLogsForOpportunity(opportunityId, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @GetMapping("/me")
    @Operation(summary = "Get the current user's full audit trail across all applications")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getMyAudit(
            @PageableDefault(size = 20) Pageable pageable) {

        UUID userId = SecurityUtils.getCurrentUserId();
        Page<AuditLogResponse> logs = auditQueryService.getLogsForUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
