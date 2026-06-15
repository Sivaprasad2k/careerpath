package com.interviewflow.common.exception;

import com.interviewflow.application.entity.OpportunityStatus;

/**
 * Thrown by OpportunityStateMachine when a workflow transition is illegal.
 * Maps to HTTP 409 Conflict — the request was valid but the current state
 * does not allow the requested transition.
 */
public class InvalidStateTransitionException extends RuntimeException {

    public InvalidStateTransitionException(OpportunityStatus from, OpportunityStatus to) {
        super(String.format(
                "Invalid transition: cannot move from '%s' to '%s'",
                from.name(), to.name()
        ));
    }
}

