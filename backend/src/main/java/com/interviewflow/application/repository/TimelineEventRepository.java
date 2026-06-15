package com.interviewflow.application.repository;

import com.interviewflow.application.entity.TimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TimelineEventRepository extends JpaRepository<TimelineEvent, UUID> {
    List<TimelineEvent> findAllByOpportunityIdAndUserIdOrderByCreatedAtDesc(UUID opportunityId, UUID userId);
    List<TimelineEvent> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
}

