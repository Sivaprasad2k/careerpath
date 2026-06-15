package com.interviewflow.application.service;

import com.interviewflow.application.entity.TimelineEvent;
import com.interviewflow.application.repository.TimelineEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimelineEventService {

    private final TimelineEventRepository repository;

    @Transactional
    public TimelineEvent logEvent(UUID opportunityId, UUID userId, String eventType, String description) {
        TimelineEvent event = TimelineEvent.builder()
                .opportunityId(opportunityId)
                .userId(userId)
                .eventType(eventType)
                .description(description)
                .build();
        TimelineEvent saved = repository.save(event);
        log.info("Timeline event logged [opportunity={}, type={}]", opportunityId, eventType);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<TimelineEvent> getEvents(UUID opportunityId, UUID userId) {
        return repository.findAllByOpportunityIdAndUserIdOrderByCreatedAtDesc(opportunityId, userId);
    }

    @Transactional(readOnly = true)
    public List<TimelineEvent> getGlobalEvents(UUID userId) {
        return repository.findAllByUserIdOrderByCreatedAtDesc(userId);
    }
}

