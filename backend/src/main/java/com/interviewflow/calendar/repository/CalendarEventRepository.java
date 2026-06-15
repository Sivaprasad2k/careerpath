package com.interviewflow.calendar.repository;

import com.interviewflow.calendar.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {
    List<CalendarEvent> findAllByUserIdOrderByEventDateAsc(UUID userId);
    List<CalendarEvent> findAllByOpportunityIdAndUserId(UUID opportunityId, UUID userId);
    void deleteAllByOpportunityIdAndUserIdAndEventType(UUID opportunityId, UUID userId, String eventType);
}
