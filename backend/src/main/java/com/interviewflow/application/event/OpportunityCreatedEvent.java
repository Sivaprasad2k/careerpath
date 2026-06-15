package com.interviewflow.application.event;

import com.interviewflow.application.entity.Opportunity;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class OpportunityCreatedEvent extends ApplicationEvent {
    private final Opportunity opportunity;
    private final UUID userId;

    public OpportunityCreatedEvent(Object source, Opportunity opportunity, UUID userId) {
        super(source);
        this.opportunity = opportunity;
        this.userId = userId;
    }
}
