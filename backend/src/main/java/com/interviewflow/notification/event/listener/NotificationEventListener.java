package com.interviewflow.notification.event.listener;

import com.interviewflow.application.event.OpportunityCreatedEvent;
import com.interviewflow.application.event.OpportunityTransitionEvent;
import com.interviewflow.notification.entity.NotificationType;
import com.interviewflow.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    @EventListener
    public void onOpportunityCreated(OpportunityCreatedEvent event) {
        notificationService.create(
                event.getUserId(),
                NotificationType.OPPORTUNITY_CREATED,
                "Opportunity saved",
                String.format("Your opportunity at %s for %s has been saved as a draft.",
                        event.getOpportunity().getCompanyName(),
                        event.getOpportunity().getRoleName())
        );
    }

    @EventListener
    public void onOpportunityTransition(OpportunityTransitionEvent event) {
        String company = event.getOpportunity().getCompanyName();
        String role = event.getOpportunity().getRoleName();

        switch (event.getCurrentStatus()) {
            case APPLIED -> notificationService.create(
                    event.getUserId(),
                    NotificationType.OPPORTUNITY_APPLIED,
                    "Opportunity applied",
                    String.format("You applied to %s for the %s role.", company, role)
            );
            case ASSESSMENT_RECEIVED -> notificationService.create(
                    event.getUserId(),
                    NotificationType.ASSESSMENT_RECEIVED,
                    "Assessment received",
                    String.format("You received an assessment from %s for %s.", company, role)
            );
            case ASSESSMENT_COMPLETED -> notificationService.create(
                    event.getUserId(),
                    NotificationType.ASSESSMENT_COMPLETED,
                    "Assessment completed",
                    String.format("Assessment completed for %s (%s).", company, role)
            );
            case INTERVIEW_SCHEDULED -> notificationService.create(
                    event.getUserId(),
                    NotificationType.INTERVIEW_SCHEDULED,
                    "Interview scheduled",
                    String.format("Interview scheduled at %s for %s.", company, role)
            );
            case INTERVIEW_COMPLETED -> notificationService.create(
                    event.getUserId(),
                    NotificationType.INTERVIEW_COMPLETED,
                    "Interview completed",
                    String.format("Interview completed with %s for %s.", company, role)
            );
            case OFFER_RECEIVED -> notificationService.create(
                    event.getUserId(),
                    NotificationType.OFFER_RECEIVED,
                    "🎉 Offer received!",
                    String.format("Congratulations! You received an offer from %s for %s.", company, role)
            );
            case ACCEPTED -> notificationService.create(
                    event.getUserId(),
                    NotificationType.OFFER_ACCEPTED,
                    "Offer accepted!",
                    String.format("You accepted the offer from %s for %s. Congratulations!", company, role)
            );
            case REJECTED -> notificationService.create(
                    event.getUserId(),
                    NotificationType.OPPORTUNITY_REJECTED,
                    "Opportunity closed",
                    String.format("Your application to %s for %s was marked as rejected.", company, role)
            );
            case DECLINED -> notificationService.create(
                    event.getUserId(),
                    NotificationType.OFFER_DECLINED,
                    "Offer declined",
                    String.format("You declined the offer from %s for %s.", company, role)
            );
            case WITHDRAWN -> notificationService.create(
                    event.getUserId(),
                    NotificationType.OPPORTUNITY_WITHDRAWN,
                    "Opportunity withdrawn",
                    String.format("You withdrew your application from %s for %s.", company, role)
            );
        }
    }
}
