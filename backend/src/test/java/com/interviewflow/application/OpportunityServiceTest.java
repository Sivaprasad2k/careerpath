package com.interviewflow.application;

import com.interviewflow.application.dto.CreateOpportunityRequest;
import com.interviewflow.application.entity.Opportunity;
import com.interviewflow.application.entity.OpportunityStatus;
import com.interviewflow.application.repository.OpportunityRepository;
import com.interviewflow.application.service.NoteService;
import com.interviewflow.application.service.OpportunityService;
import com.interviewflow.application.statemachine.OpportunityStateMachine;
import com.interviewflow.common.exception.InvalidStateTransitionException;
import com.interviewflow.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OpportunityService")
class OpportunityServiceTest {

    @Mock OpportunityRepository repository;
    @Mock OpportunityStateMachine stateMachine;
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock NoteService noteService;

    @InjectMocks OpportunityService service;

    private UUID userId;
    private UUID opportunityId;
    private Opportunity draftOpportunity;

    @BeforeEach
    void setUp() {
        userId        = UUID.randomUUID();
        opportunityId = UUID.randomUUID();
        draftOpportunity = Opportunity.builder()
                .id(opportunityId)
                .userId(userId)
                .companyName("Acme Corp")
                .roleName("Senior Engineer")
                .currentStatus(OpportunityStatus.DRAFT)
                .build();
    }

    @Nested
    @DisplayName("create")
    class Create {
        @Test
        @DisplayName("persists opportunity with DRAFT status and publishes event")
        void create_persistsDraftAndPublishesEvent() {
            given(repository.save(any(Opportunity.class))).willReturn(draftOpportunity);

            var response = service.create(
                    new CreateOpportunityRequest("Acme Corp", "Senior Engineer", null, null, null, null, null, null),
                    userId
            );

            assertThat(response.currentStatus()).isEqualTo(OpportunityStatus.DRAFT);
            assertThat(response.companyName()).isEqualTo("Acme Corp");
            verify(repository).save(any(Opportunity.class));
            verify(eventPublisher).publishEvent(any());
        }
    }

    @Nested
    @DisplayName("getById - ownership")
    class GetById {
        @Test
        @DisplayName("returns opportunity when user owns it")
        void getById_ownedByUser_returnsOpportunity() {
            given(repository.findById(opportunityId))
                    .willReturn(Optional.of(draftOpportunity));

            var response = service.getById(opportunityId, userId);

            assertThat(response.id()).isEqualTo(opportunityId);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when another user requests it")
        void getById_differentUser_throwsNotFound() {
            UUID attackerId = UUID.randomUUID();
            given(repository.findById(opportunityId))
                    .willReturn(Optional.of(draftOpportunity));

            assertThatThrownBy(() -> service.getById(opportunityId, attackerId))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when id does not exist")
        void getById_nonExistent_throwsNotFound() {
            given(repository.findById(any())).willReturn(Optional.empty());

            assertThatThrownBy(() -> service.getById(UUID.randomUUID(), userId))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("workflow transitions")
    class Transitions {
        @Test
        @DisplayName("apply: calls stateMachine, sets status, publishes event")
        void apply_validTransition_succeeds() {
            given(repository.findById(opportunityId))
                    .willReturn(Optional.of(draftOpportunity));
            given(repository.save(any())).willAnswer(inv -> inv.getArgument(0));
            doNothing().when(stateMachine).transition(OpportunityStatus.DRAFT, OpportunityStatus.APPLIED);

            var response = service.apply(opportunityId, userId);

            assertThat(response.currentStatus()).isEqualTo(OpportunityStatus.APPLIED);
            verify(stateMachine).transition(OpportunityStatus.DRAFT, OpportunityStatus.APPLIED);
            verify(eventPublisher).publishEvent(any());
        }

        @Test
        @DisplayName("apply: state machine rejection propagates as InvalidStateTransitionException")
        void apply_invalidState_propagatesException() {
            Opportunity appliedApp = Opportunity.builder()
                    .id(opportunityId).userId(userId)
                    .currentStatus(OpportunityStatus.APPLIED).build();
            given(repository.findById(opportunityId)).willReturn(Optional.of(appliedApp));
            doThrow(new InvalidStateTransitionException(OpportunityStatus.APPLIED, OpportunityStatus.APPLIED))
                    .when(stateMachine).transition(OpportunityStatus.APPLIED, OpportunityStatus.APPLIED);

            assertThatThrownBy(() -> service.apply(opportunityId, userId))
                    .isInstanceOf(InvalidStateTransitionException.class);

            verify(repository, never()).save(any());
            verify(eventPublisher, never()).publishEvent(any());
        }

        @Test
        @DisplayName("reject: ownership validated before transition")
        void reject_wrongUser_throwsNotFound() {
            given(repository.findById(opportunityId))
                    .willReturn(Optional.of(draftOpportunity));

            UUID wrongUser = UUID.randomUUID();
            assertThatThrownBy(() -> service.reject(opportunityId, wrongUser))
                    .isInstanceOf(ResourceNotFoundException.class);

            verify(stateMachine, never()).transition(any(), any());
            verify(repository, never()).save(any());
        }
    }
}
