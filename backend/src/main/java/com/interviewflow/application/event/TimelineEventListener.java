package com.interviewflow.application.event;

import com.interviewflow.application.entity.Opportunity;
import com.interviewflow.application.service.TimelineEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TimelineEventListener {

    private final TimelineEventService timelineEventService;

    @EventListener
    public void onOpportunityCreated(OpportunityCreatedEvent event) {
        Opportunity opp = event.getOpportunity();
        timelineEventService.logEvent(
                opp.getId(),
                event.getUserId(),
                "OPPORTUNITY_CREATED",
                String.format("Your opportunity at %s for the %s role has been saved as a draft.",
                        opp.getCompanyName(),
                        opp.getRoleName())
        );
    }

    @EventListener
    public void onOpportunityTransition(OpportunityTransitionEvent event) {
        Opportunity opp = event.getOpportunity();
        String company = opp.getCompanyName();
        String role = opp.getRoleName();
        String desc = switch (event.getCurrentStatus()) {
            case APPLIED -> String.format("You applied to %s for the %s role.", company, role);
            case ASSESSMENT_RECEIVED -> String.format("You received an assessment from %s for %s.", company, role);
            case ASSESSMENT_COMPLETED -> String.format("Assessment completed for %s (%s).", company, role);
            case INTERVIEW_SCHEDULED -> String.format("Interview scheduled at %s for %s.", company, role);
            case INTERVIEW_COMPLETED -> String.format("Interview completed with %s for %s.", company, role);
            case OFFER_RECEIVED -> String.format("Congratulations! You received an offer from %s for %s.", company, role);
            case ACCEPTED -> String.format("You accepted the offer from %s for %s. Congratulations!", company, role);
            case REJECTED -> String.format("Your application to %s for %s was marked as rejected.", company, role);
            case DECLINED -> String.format("You declined the offer from %s for %s.", company, role);
            case WITHDRAWN -> String.format("You withdrew your application from %s for %s.", company, role);
            default -> String.format("Opportunity transitioned to %s.", event.getCurrentStatus().name());
        };

        timelineEventService.logEvent(
                opp.getId(),
                event.getUserId(),
                event.getCurrentStatus().name(),
                desc
        );
    }
}
