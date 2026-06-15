package com.interviewflow.application;

import com.interviewflow.application.entity.OpportunityStatus;
import com.interviewflow.application.statemachine.OpportunityStateMachine;
import com.interviewflow.common.exception.InvalidStateTransitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("OpportunityStateMachine")
class OpportunityStateMachineTest {

    private OpportunityStateMachine stateMachine;

    @BeforeEach
    void setUp() {
        stateMachine = new OpportunityStateMachine();
    }

    @Nested
    @DisplayName("Valid transitions")
    class ValidTransitions {

        @ParameterizedTest(name = "{0} → {1}")
        @CsvSource({
                "DRAFT,                 APPLIED",
                "DRAFT,                 REJECTED",
                "DRAFT,                 WITHDRAWN",
                "APPLIED,               ASSESSMENT_RECEIVED",
                "APPLIED,               INTERVIEW_SCHEDULED",
                "APPLIED,               REJECTED",
                "APPLIED,               WITHDRAWN",
                "ASSESSMENT_RECEIVED,   ASSESSMENT_COMPLETED",
                "ASSESSMENT_RECEIVED,   INTERVIEW_SCHEDULED",
                "ASSESSMENT_RECEIVED,   REJECTED",
                "ASSESSMENT_RECEIVED,   WITHDRAWN",
                "ASSESSMENT_COMPLETED,  INTERVIEW_SCHEDULED",
                "ASSESSMENT_COMPLETED,  OFFER_RECEIVED",
                "ASSESSMENT_COMPLETED,  REJECTED",
                "ASSESSMENT_COMPLETED,  WITHDRAWN",
                "INTERVIEW_SCHEDULED,   INTERVIEW_COMPLETED",
                "INTERVIEW_SCHEDULED,   OFFER_RECEIVED",
                "INTERVIEW_SCHEDULED,   REJECTED",
                "INTERVIEW_SCHEDULED,   WITHDRAWN",
                "INTERVIEW_COMPLETED,   OFFER_RECEIVED",
                "INTERVIEW_COMPLETED,   REJECTED",
                "INTERVIEW_COMPLETED,   WITHDRAWN",
                "OFFER_RECEIVED,        ACCEPTED",
                "OFFER_RECEIVED,        DECLINED",
                "OFFER_RECEIVED,        WITHDRAWN"
        })
        void shouldAllowValidTransition(String from, String to) {
            assertThatNoException()
                    .isThrownBy(() -> stateMachine.transition(
                            OpportunityStatus.valueOf(from),
                            OpportunityStatus.valueOf(to)));
        }
    }

    @Nested
    @DisplayName("Invalid transitions")
    class InvalidTransitions {

        @ParameterizedTest(name = "{0} → {1} should be blocked")
        @CsvSource({
                "DRAFT,                 ASSESSMENT_RECEIVED",
                "DRAFT,                 INTERVIEW_SCHEDULED",
                "DRAFT,                 OFFER_RECEIVED",
                "APPLIED,               DRAFT",
                "APPLIED,               ASSESSMENT_COMPLETED",
                "ASSESSMENT_RECEIVED,   APPLIED",
                "ACCEPTED,              OFFER_RECEIVED",
                "ACCEPTED,              REJECTED",
                "REJECTED,              APPLIED",
                "REJECTED,              DRAFT",
                "DECLINED,              OFFER_RECEIVED",
                "WITHDRAWN,             DRAFT"
        })
        void shouldBlockInvalidTransition(String from, String to) {
            assertThatThrownBy(() -> stateMachine.transition(
                    OpportunityStatus.valueOf(from),
                    OpportunityStatus.valueOf(to)))
                    .isInstanceOf(InvalidStateTransitionException.class)
                    .hasMessageContaining(from)
                    .hasMessageContaining(to);
        }

        @Test
        @DisplayName("ACCEPTED is a terminal state — no transitions allowed")
        void terminalAccepted() {
            assertThatThrownBy(() -> stateMachine.transition(
                    OpportunityStatus.ACCEPTED, OpportunityStatus.OFFER_RECEIVED))
                    .isInstanceOf(InvalidStateTransitionException.class);
        }

        @Test
        @DisplayName("REJECTED is a terminal state — no transitions allowed")
        void terminalRejected() {
            assertThatThrownBy(() -> stateMachine.transition(
                    OpportunityStatus.REJECTED, OpportunityStatus.APPLIED))
                    .isInstanceOf(InvalidStateTransitionException.class);
        }
    }

    @Nested
    @DisplayName("getAllowedTransitions")
    class AllowedTransitionsQuery {

        @Test
        void draftShouldHaveThreeAllowedTransitions() {
            var allowed = stateMachine.getAllowedTransitions(OpportunityStatus.DRAFT);
            org.assertj.core.api.Assertions.assertThat(allowed)
                    .containsExactlyInAnyOrder(
                            OpportunityStatus.APPLIED, OpportunityStatus.REJECTED, OpportunityStatus.WITHDRAWN);
        }

        @Test
        void terminalStatesShouldHaveNoAllowedTransitions() {
            org.assertj.core.api.Assertions.assertThat(
                    stateMachine.getAllowedTransitions(OpportunityStatus.ACCEPTED)).isEmpty();
            org.assertj.core.api.Assertions.assertThat(
                    stateMachine.getAllowedTransitions(OpportunityStatus.REJECTED)).isEmpty();
            org.assertj.core.api.Assertions.assertThat(
                    stateMachine.getAllowedTransitions(OpportunityStatus.DECLINED)).isEmpty();
            org.assertj.core.api.Assertions.assertThat(
                    stateMachine.getAllowedTransitions(OpportunityStatus.WITHDRAWN)).isEmpty();
        }
    }
}
