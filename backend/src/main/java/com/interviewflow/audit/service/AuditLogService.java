package com.interviewflow.audit.service;

import com.interviewflow.audit.entity.AuditLog;
import com.interviewflow.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Persists an audit entry.
     *
     * Uses Propagation.REQUIRES_NEW so the audit write is independent of the
     * calling transaction. Even if the caller's transaction rolls back,
     * the audit record is preserved — giving us a trace of what was attempted.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(UUID userId,
                    String entityType,
                    UUID entityId,
                    String action,
                    Map<String, Object> oldValue,
                    Map<String, Object> newValue) {
        AuditLog entry = AuditLog.builder()
                .userId(userId)
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();

        auditLogRepository.save(entry);
        log.debug("Audit logged: {} {} by user {}", action, entityId, userId);
    }
}
