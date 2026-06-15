package com.interviewflow.application.event;

import com.interviewflow.application.entity.Opportunity;
import com.interviewflow.application.entity.OpportunityStatus;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.Map;
import java.util.UUID;

@Getter
public class OpportunityTransitionEvent extends ApplicationEvent {
    private final Opportunity opportunity;
    private final UUID userId;
    private final OpportunityStatus previousStatus;
    private final OpportunityStatus currentStatus;
    private final Map<String, Object> metadata;

    public OpportunityTransitionEvent(Object source, Opportunity opportunity, UUID userId,
                                      OpportunityStatus previousStatus, OpportunityStatus currentStatus,
                                      Map<String, Object> metadata) {
        super(source);
        this.opportunity = opportunity;
        this.userId = userId;
        this.previousStatus = previousStatus;
        this.currentStatus = currentStatus;
        this.metadata = metadata;
    }
}
