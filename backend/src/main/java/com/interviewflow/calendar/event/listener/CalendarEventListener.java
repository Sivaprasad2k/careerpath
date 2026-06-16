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
                    String roundType = (String) event.getMetadata().get("roundType");
                    String outcome = (String) event.getMetadata().get("outcome");
                    Integer duration = (Integer) event.getMetadata().get("durationMinutes");
                    String notes = (String) event.getMetadata().get("notes");

                    String title = opp.getCompanyName() + " - " + (roundType != null ? roundType : "General") + " Interview";

                    StringBuilder descBuilder = new StringBuilder();
                    descBuilder.append(String.format("Interview for %s role at %s.%n", opp.getRoleName(), opp.getCompanyName()));
                    descBuilder.append(String.format("Round Type: %s%n", roundType != null ? roundType : "N/A"));
                    descBuilder.append(String.format("Platform: %s%n", platform != null ? platform : "N/A"));
                    if (interviewer != null && !interviewer.trim().isEmpty()) {
                        descBuilder.append(String.format("Interviewer: %s%n", interviewer));
                    }
                    if (duration != null) {
                        descBuilder.append(String.format("Duration: %d minutes%n", duration));
                    }
                    if (outcome != null && !outcome.trim().isEmpty()) {
                        descBuilder.append(String.format("Outcome: %s%n", outcome));
                    }
                    if (notes != null && !notes.trim().isEmpty()) {
                        descBuilder.append(String.format("%nPreparation Notes:%n%s", notes));
                    }

                    calendarEventService.scheduleEvent(
                            opp.getId(),
                            event.getUserId(),
                            title,
                            "INTERVIEW_DATE",
                            interviewDate,
                            descBuilder.toString()
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
