package com.interviewflow.calendar.event.listener;

import com.interviewflow.application.entity.Opportunity;
import com.interviewflow.application.event.OpportunityTransitionEvent;
import com.interviewflow.calendar.service.CalendarEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class CalendarEventListener {

    private final CalendarEventService calendarEventService;

    @EventListener
    public void onOpportunityTransition(OpportunityTransitionEvent event) {
        Opportunity opp = event.getOpportunity();
        Instant now = Instant.now();

        switch (event.getCurrentStatus()) {
            case APPLIED -> {
                // Auto-create a follow-up calendar event in 7 days
                Instant followUpDate = now.plus(7, ChronoUnit.DAYS);
                calendarEventService.scheduleEvent(
                        opp.getId(),
                        event.getUserId(),
                        "Follow up on " + opp.getCompanyName() + " application",
                        "FOLLOW_UP_DATE",
                        followUpDate,
                        "Reach out regarding the status of your " + opp.getRoleName() + " application."
                );
            }
            case ASSESSMENT_RECEIVED -> {
                Instant deadline = (Instant) event.getMetadata().get("deadlineDate");
                if (deadline != null) {
                    calendarEventService.scheduleEvent(
                            opp.getId(),
                            event.getUserId(),
                            opp.getCompanyName() + " Assessment Deadline",
                            "ASSESSMENT_DEADLINE",
                            deadline,
                            "Complete and submit the assessment for the " + opp.getRoleName() + " role."
                    );
                }
            }
            case INTERVIEW_SCHEDULED -> {
                Instant interviewDate = (Instant) event.getMetadata().get("scheduledAt");
                if (interviewDate != null) {
                    String platform = (String) event.getMetadata().get("platform");
                    String interviewer = (String) event.getMetadata().get("interviewerName");
                    String desc = String.format("Interview for %s role at %s.%nPlatform: %s%nInterviewer: %s",
                            opp.getRoleName(), opp.getCompanyName(),
                            platform != null ? platform : "N/A",
                            interviewer != null ? interviewer : "N/A");

                    calendarEventService.scheduleEvent(
                            opp.getId(),
                            event.getUserId(),
                            opp.getCompanyName() + " Interview",
                            "INTERVIEW_DATE",
                            interviewDate,
                            desc
                    );
                }
            }
            case OFFER_RECEIVED -> {
                Instant expiry = (Instant) event.getMetadata().get("offerExpiryDate");
                if (expiry != null) {
                    calendarEventService.scheduleEvent(
                            opp.getId(),
                            event.getUserId(),
                            opp.getCompanyName() + " Offer Expiry",
                            "OFFER_EXPIRY_DATE",
                            expiry,
                            "Decide on the job offer from " + opp.getCompanyName() + " for " + opp.getRoleName() + "."
                    );
                }
            }
        }
    }
}
