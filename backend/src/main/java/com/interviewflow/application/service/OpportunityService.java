package com.interviewflow.application.service;

import com.interviewflow.application.dto.*;
import com.interviewflow.application.entity.Opportunity;
import com.interviewflow.application.entity.OpportunityStatus;
import com.interviewflow.application.event.OpportunityCreatedEvent;
import com.interviewflow.application.event.OpportunityTransitionEvent;
import com.interviewflow.application.repository.OpportunityRepository;
import com.interviewflow.application.statemachine.OpportunityStateMachine;
import com.interviewflow.common.exception.ResourceNotFoundException;
import com.interviewflow.common.exception.DuplicateResourceException;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpportunityService {

    private final OpportunityRepository repository;
    private final OpportunityStateMachine stateMachine;
    private final ApplicationEventPublisher eventPublisher;
    private final NoteService noteService;

    @Transactional
    public OpportunityResponse create(CreateOpportunityRequest request, UUID userId) {
        if (repository.existsByUserIdAndCompanyNameIgnoreCaseAndRoleNameIgnoreCase(userId, request.companyName().trim(), request.roleName().trim())) {
            throw new DuplicateResourceException("An application for \"" + request.roleName() + "\" at \"" + request.companyName() + "\" already exists.");
        }

        Opportunity opportunity = Opportunity.builder()
                .userId(userId)
                .companyName(request.companyName())
                .roleName(request.roleName())
                .location(request.location())
                .source(request.source())
                .salary(request.salary())
                .priority(request.priority() != null ? request.priority() : "MEDIUM")
                .applicationDate(request.applicationDate())
                .currentStatus(OpportunityStatus.DRAFT)
                .build();

        Opportunity saved = repository.save(opportunity);
        eventPublisher.publishEvent(new OpportunityCreatedEvent(this, saved, userId));

        if (request.notes() != null && !request.notes().trim().isEmpty()) {
            noteService.create(saved.getId(), request.notes().trim(), userId);
        }

        log.info("Opportunity created [id={}, user={}]", saved.getId(), userId);
        return toDetailResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<OpportunitySummaryResponse> listByUser(UUID userId, Pageable pageable) {
        return repository.findAllByUserId(userId, pageable)
                .map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public OpportunityResponse getById(UUID id, UUID userId) {
        return toDetailResponse(findOwnedOpportunity(id, userId));
    }

    @Transactional
    public OpportunityResponse update(UUID id, UpdateOpportunityRequest request, UUID userId) {
        Opportunity opportunity = findOwnedOpportunity(id, userId);

        if (request.companyName() != null) opportunity.setCompanyName(request.companyName());
        if (request.roleName() != null)    opportunity.setRoleName(request.roleName());
        if (request.location() != null)    opportunity.setLocation(request.location());
        if (request.source() != null)      opportunity.setSource(request.source());
        if (request.salary() != null)      opportunity.setSalary(request.salary());
        if (request.priority() != null)    opportunity.setPriority(request.priority());
        if (request.applicationDate() != null) opportunity.setApplicationDate(request.applicationDate());

        return toDetailResponse(repository.save(opportunity));
    }


    @Transactional
    public void delete(UUID id, UUID userId) {
        Opportunity opportunity = findOwnedOpportunity(id, userId);
        repository.delete(opportunity);
        log.info("Opportunity deleted [id={}, user={}]", id, userId);
    }

    // ─── WORKFLOW TRANSITIONS ────────────────────────────────────────────────────

    @Transactional
    public OpportunityResponse apply(UUID id, UUID userId) {
        return transition(id, userId, OpportunityStatus.APPLIED, new HashMap<>());
    }

    @Transactional
    public OpportunityResponse receiveAssessment(UUID id, ReceiveAssessmentRequest request, UUID userId) {
        Map<String, Object> metadata = new HashMap<>();
        if (request.deadlineDate() != null) {
            metadata.put("deadlineDate", request.deadlineDate());
        }
        return transition(id, userId, OpportunityStatus.ASSESSMENT_RECEIVED, metadata);
    }

    @Transactional
    public OpportunityResponse completeAssessment(UUID id, UUID userId) {
        return transition(id, userId, OpportunityStatus.ASSESSMENT_COMPLETED, new HashMap<>());
    }

    @Transactional
    public OpportunityResponse scheduleInterview(UUID id, ScheduleInterviewRequest request, UUID userId) {
        Map<String, Object> metadata = new HashMap<>();
        if (request.roundType() != null) {
            metadata.put("roundType", request.roundType());
        }
        if (request.scheduledAt() != null) {
            metadata.put("scheduledAt", request.scheduledAt());
        }
        if (request.interviewerName() != null) {
            metadata.put("interviewerName", request.interviewerName());
        }
        if (request.platform() != null) {
            metadata.put("platform", request.platform());
        }
        if (request.durationMinutes() != null) {
            metadata.put("durationMinutes", request.durationMinutes());
        }
        if (request.notes() != null) {
            metadata.put("notes", request.notes());
        }
        if (request.outcome() != null) {
            metadata.put("outcome", request.outcome());
        }
        return transition(id, userId, OpportunityStatus.INTERVIEW_SCHEDULED, metadata);
    }

    @Transactional
    public OpportunityResponse completeInterview(UUID id, UUID userId) {
        return transition(id, userId, OpportunityStatus.INTERVIEW_COMPLETED, new HashMap<>());
    }

    @Transactional
    public OpportunityResponse receiveOffer(UUID id, ReceiveOfferRequest request, UUID userId) {
        Opportunity opportunity = findOwnedOpportunity(id, userId);
        if (request.salary() != null) {
            opportunity.setSalary(request.salary());
        }

        Map<String, Object> metadata = new HashMap<>();
        if (request.offerExpiryDate() != null) {
            metadata.put("offerExpiryDate", request.offerExpiryDate());
        }

        OpportunityStatus previous = opportunity.getCurrentStatus();
        stateMachine.transition(previous, OpportunityStatus.OFFER_RECEIVED);

        opportunity.setCurrentStatus(OpportunityStatus.OFFER_RECEIVED);
        Opportunity saved = repository.save(opportunity);

        eventPublisher.publishEvent(new OpportunityTransitionEvent(this, saved, userId, previous, OpportunityStatus.OFFER_RECEIVED, metadata));
        return toDetailResponse(saved);
    }

    @Transactional
    public OpportunityResponse acceptOffer(UUID id, UUID userId) {
        return transition(id, userId, OpportunityStatus.ACCEPTED, new HashMap<>());
    }

    @Transactional
    public OpportunityResponse reject(UUID id, UUID userId) {
        return transition(id, userId, OpportunityStatus.REJECTED, new HashMap<>());
    }

    @Transactional
    public OpportunityResponse declineOffer(UUID id, UUID userId) {
        return transition(id, userId, OpportunityStatus.DECLINED, new HashMap<>());
    }

    @Transactional
    public OpportunityResponse withdraw(UUID id, UUID userId) {
        return transition(id, userId, OpportunityStatus.WITHDRAWN, new HashMap<>());
    }

    // ─── PRIVATE HELPERS ────────────────────────────────────────────────────────

    private OpportunityResponse transition(UUID id, UUID userId, OpportunityStatus target, Map<String, Object> metadata) {
        Opportunity opportunity = findOwnedOpportunity(id, userId);
        OpportunityStatus previous = opportunity.getCurrentStatus();

        stateMachine.transition(previous, target);

        opportunity.setCurrentStatus(target);
        if (target == OpportunityStatus.APPLIED && opportunity.getApplicationDate() == null) {
            opportunity.setApplicationDate(LocalDate.now());
        }

        Opportunity saved = repository.save(opportunity);
        eventPublisher.publishEvent(new OpportunityTransitionEvent(this, saved, userId, previous, target, metadata));

        log.info("Opportunity [{}] transitioned {} → {} by user [{}]", id, previous, target, userId);
        return toDetailResponse(saved);
    }

    private Opportunity findOwnedOpportunity(UUID id, UUID userId) {
        return repository.findById(id)
                .filter(opp -> opp.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity", "id", id));
    }

    private OpportunityResponse toDetailResponse(Opportunity opp) {
        return new OpportunityResponse(
                opp.getId(),
                opp.getCompanyName(),
                opp.getRoleName(),
                opp.getLocation(),
                opp.getSource(),
                opp.getSalary(),
                opp.getPriority(),
                opp.getApplicationDate(),
                opp.getCurrentStatus(),
                stateMachine.getAllowedTransitions(opp.getCurrentStatus()),
                opp.getCreatedAt(),
                opp.getUpdatedAt()
        );
    }

    private OpportunitySummaryResponse toSummaryResponse(Opportunity opp) {
        return new OpportunitySummaryResponse(
                opp.getId(),
                opp.getCompanyName(),
                opp.getRoleName(),
                opp.getLocation(),
                opp.getPriority(),
                opp.getCurrentStatus(),
                opp.getUpdatedAt()
        );
    }
}
