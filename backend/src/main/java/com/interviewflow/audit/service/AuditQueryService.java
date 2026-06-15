package com.interviewflow.audit.service;

import com.interviewflow.audit.dto.AuditLogResponse;
import com.interviewflow.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Read-only query service for audit logs.
 *
 * Separated from AuditLogService (write side) intentionally:
 * write operations use REQUIRES_NEW propagation for independence;
 * reads are standard read-only transactions.
 * Keeping them separate avoids propagation config conflicts and
 * makes each class's responsibility unambiguous.
 */
@Service
@RequiredArgsConstructor
public class AuditQueryService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getLogsForOpportunity(UUID opportunityId, Pageable pageable) {
        return auditLogRepository
                .findAllByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                        "Opportunity", opportunityId, pageable)
                .map(log -> new AuditLogResponse(
                        log.getId(), log.getUserId(), log.getEntityType(),
                        log.getEntityId(), log.getAction(),
                        log.getOldValue(), log.getNewValue(), log.getCreatedAt()));
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getLogsForUser(UUID userId, Pageable pageable) {
        return auditLogRepository
                .findAllByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(log -> new AuditLogResponse(
                        log.getId(), log.getUserId(), log.getEntityType(),
                        log.getEntityId(), log.getAction(),
                        log.getOldValue(), log.getNewValue(), log.getCreatedAt()));
    }
}
