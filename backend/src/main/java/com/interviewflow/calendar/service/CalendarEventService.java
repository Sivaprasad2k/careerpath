package com.interviewflow.calendar.service;

import com.interviewflow.calendar.entity.CalendarEvent;
import com.interviewflow.calendar.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalendarEventService {

    private final CalendarEventRepository repository;

    @Transactional(readOnly = true)
    public List<CalendarEvent> listEvents(UUID userId) {
        return repository.findAllByUserIdOrderByEventDateAsc(userId);
    }

    @Transactional(readOnly = true)
    public List<CalendarEvent> listEventsForOpportunity(UUID opportunityId, UUID userId) {
        return repository.findAllByOpportunityIdAndUserId(opportunityId, userId);
    }

    @Transactional
    public CalendarEvent scheduleEvent(UUID opportunityId, UUID userId, String title, String eventType, Instant date, String description) {
        // Remove existing events of this type for this opportunity to prevent duplicate dates
        repository.deleteAllByOpportunityIdAndUserIdAndEventType(opportunityId, userId, eventType);

        CalendarEvent event = CalendarEvent.builder()
                .opportunityId(opportunityId)
                .userId(userId)
                .title(title)
                .eventType(eventType)
                .eventDate(date)
                .description(description)
                .build();
        CalendarEvent saved = repository.save(event);
        log.info("Calendar event scheduled [opportunity={}, type={}]", opportunityId, eventType);
        return saved;
    }

    @Transactional
    public void deleteEvent(UUID eventId, UUID userId) {
        repository.findById(eventId)
                .filter(e -> e.getUserId().equals(userId))
                .ifPresent(repository::delete);
    }
}
