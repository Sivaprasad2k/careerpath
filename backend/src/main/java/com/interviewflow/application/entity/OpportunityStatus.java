package com.interviewflow.application.entity;

/**
 * Defines all valid states in the Opportunity lifecycle.
 */
public enum OpportunityStatus {
    DRAFT,
    APPLIED,
    ASSESSMENT_RECEIVED,
    ASSESSMENT_COMPLETED,
    INTERVIEW_SCHEDULED,
    INTERVIEW_COMPLETED,
    OFFER_RECEIVED,
    ACCEPTED,
    REJECTED,
    DECLINED,
    WITHDRAWN;

    public boolean isTerminal() {
        return this == ACCEPTED || this == REJECTED || this == DECLINED || this == WITHDRAWN;
    }
}
