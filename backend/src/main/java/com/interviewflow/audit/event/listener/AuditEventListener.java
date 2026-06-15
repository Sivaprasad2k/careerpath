package com.interviewflow.audit.event.listener;

import com.interviewflow.application.entity.Opportunity;
import com.interviewflow.application.event.OpportunityCreatedEvent;
import com.interviewflow.application.event.OpportunityTransitionEvent;
import com.interviewflow.audit.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditLogService auditLogService;

    @EventListener
    public void onOpportunityCreated(OpportunityCreatedEvent event) {
        log(event.getOpportunity(), "OPPORTUNITY_CREATED", null,
                buildSnapshot(event.getOpportunity()), event.getUserId());
    }

    @EventListener
    public void onOpportunityTransition(OpportunityTransitionEvent event) {
        log(event.getOpportunity(), "OPPORTUNITY_TRANSITIONED",
                Map.of("status", event.getPreviousStatus().name()),
                buildSnapshot(event.getOpportunity()), event.getUserId());
    }

    private void log(Opportunity opp, String action,
                      Map<String, Object> oldValue, Map<String, Object> newValue,
                      java.util.UUID userId) {
        auditLogService.log(userId, "Opportunity", opp.getId(), action, oldValue, newValue);
    }

    private Map<String, Object> buildSnapshot(Opportunity opp) {
        return Map.of(
                "status",      opp.getCurrentStatus().name(),
                "companyName", opp.getCompanyName(),
                "roleName",    opp.getRoleName()
        );
    }
}
