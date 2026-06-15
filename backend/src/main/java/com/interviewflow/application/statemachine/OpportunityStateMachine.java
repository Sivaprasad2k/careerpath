package com.interviewflow.application.statemachine;

import com.interviewflow.application.entity.OpportunityStatus;
import com.interviewflow.common.exception.InvalidStateTransitionException;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class OpportunityStateMachine {

    private static final Map<OpportunityStatus, Set<OpportunityStatus>> ALLOWED_TRANSITIONS =
            Map.ofEntries(
                    Map.entry(OpportunityStatus.DRAFT,                 Set.of(OpportunityStatus.APPLIED, OpportunityStatus.REJECTED, OpportunityStatus.WITHDRAWN)),
                    Map.entry(OpportunityStatus.APPLIED,               Set.of(OpportunityStatus.ASSESSMENT_RECEIVED, OpportunityStatus.INTERVIEW_SCHEDULED, OpportunityStatus.REJECTED, OpportunityStatus.WITHDRAWN)),
                    Map.entry(OpportunityStatus.ASSESSMENT_RECEIVED,   Set.of(OpportunityStatus.ASSESSMENT_COMPLETED, OpportunityStatus.INTERVIEW_SCHEDULED, OpportunityStatus.REJECTED, OpportunityStatus.WITHDRAWN)),
                    Map.entry(OpportunityStatus.ASSESSMENT_COMPLETED,  Set.of(OpportunityStatus.INTERVIEW_SCHEDULED, OpportunityStatus.OFFER_RECEIVED, OpportunityStatus.REJECTED, OpportunityStatus.WITHDRAWN)),
                    Map.entry(OpportunityStatus.INTERVIEW_SCHEDULED,   Set.of(OpportunityStatus.INTERVIEW_COMPLETED, OpportunityStatus.OFFER_RECEIVED, OpportunityStatus.REJECTED, OpportunityStatus.WITHDRAWN)),
                    Map.entry(OpportunityStatus.INTERVIEW_COMPLETED,   Set.of(OpportunityStatus.OFFER_RECEIVED, OpportunityStatus.REJECTED, OpportunityStatus.WITHDRAWN)),
                    Map.entry(OpportunityStatus.OFFER_RECEIVED,        Set.of(OpportunityStatus.ACCEPTED, OpportunityStatus.DECLINED, OpportunityStatus.WITHDRAWN)),
                    Map.entry(OpportunityStatus.ACCEPTED,              Set.of()),
                    Map.entry(OpportunityStatus.REJECTED,              Set.of()),
                    Map.entry(OpportunityStatus.DECLINED,              Set.of()),
                    Map.entry(OpportunityStatus.WITHDRAWN,             Set.of())
            );

    /**
     * Validates and applies a state transition.
     * Throws InvalidStateTransitionException if the transition is not allowed.
     */
    public void transition(OpportunityStatus currentStatus, OpportunityStatus targetStatus) {
        Set<OpportunityStatus> allowedTargets = ALLOWED_TRANSITIONS.getOrDefault(
                currentStatus, Set.of()
        );

        if (!allowedTargets.contains(targetStatus)) {
            throw new InvalidStateTransitionException(currentStatus, targetStatus);
        }
    }

    /**
     * Returns the set of valid next statuses from a given status.
     */
    public Set<OpportunityStatus> getAllowedTransitions(OpportunityStatus currentStatus) {
        return ALLOWED_TRANSITIONS.getOrDefault(currentStatus, Set.of());
    }
}
