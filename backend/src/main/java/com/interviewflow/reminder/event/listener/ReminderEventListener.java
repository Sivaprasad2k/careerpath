package com.interviewflow.reminder.event.listener;

import com.interviewflow.application.entity.Opportunity;
import com.interviewflow.application.event.OpportunityTransitionEvent;
import com.interviewflow.reminder.service.ReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderEventListener {

    private final ReminderService reminderService;

    @EventListener
    public void onOpportunityTransition(OpportunityTransitionEvent event) {
        Opportunity opp = event.getOpportunity();
        Instant now = Instant.now();

        switch (event.getCurrentStatus()) {
            case APPLIED -> {
                // Auto-create a follow-up reminder in 7 days
                Instant remindAt = now.plus(7, ChronoUnit.DAYS);
                reminderService.createReminder(
                        opp.getId(),
                        event.getUserId(),
                        "Follow up with " + opp.getCompanyName(),
                        "FOLLOW_UP_REMINDER",
                        remindAt
                );
            }
            case ASSESSMENT_RECEIVED -> {
                Instant deadline = (Instant) event.getMetadata().get("deadlineDate");
                if (deadline != null) {
                    // Remind 1 day before deadline
                    Instant remindAt = deadline.minus(1, ChronoUnit.DAYS);
                    if (remindAt.isBefore(now)) {
                        remindAt = now.plus(1, ChronoUnit.HOURS); // schedule shortly if tight
                    }
                    reminderService.createReminder(
                            opp.getId(),
                            event.getUserId(),
                            "Assessment deadline tomorrow: " + opp.getCompanyName(),
                            "ASSESSMENT_DEADLINE",
                            remindAt
                    );
                }
            }
            case INTERVIEW_SCHEDULED -> {
                Instant interviewDate = (Instant) event.getMetadata().get("scheduledAt");
                if (interviewDate != null) {
                    // Remind 2 hours before interview
                    Instant remindAt = interviewDate.minus(2, ChronoUnit.HOURS);
                    if (remindAt.isBefore(now)) {
                        remindAt = now.plus(15, ChronoUnit.MINUTES);
                    }
                    reminderService.createReminder(
                            opp.getId(),
                            event.getUserId(),
                            "Interview starts soon: " + opp.getCompanyName(),
                            "UPCOMING_INTERVIEW",
                            remindAt
                    );
                }
            }
            case OFFER_RECEIVED -> {
                Instant expiry = (Instant) event.getMetadata().get("offerExpiryDate");
                if (expiry != null) {
                    // Remind 1 day before expiry
                    Instant remindAt = expiry.minus(1, ChronoUnit.DAYS);
                    if (remindAt.isBefore(now)) {
                        remindAt = now.plus(1, ChronoUnit.HOURS);
                    }
                    reminderService.createReminder(
                            opp.getId(),
                            event.getUserId(),
                            "Offer expiring tomorrow: " + opp.getCompanyName(),
                            "OFFER_EXPIRY_REMINDER",
                            remindAt
                    );
                }
            }
        }
    }
}
