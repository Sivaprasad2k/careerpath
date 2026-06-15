package com.interviewflow.reminder.repository;

import com.interviewflow.reminder.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, UUID> {
    List<Reminder> findAllByUserIdAndIsDismissedOrderByRemindAtAsc(UUID userId, boolean isDismissed);
    List<Reminder> findAllByOpportunityIdAndUserId(UUID opportunityId, UUID userId);
    Optional<Reminder> findByIdAndUserId(UUID id, UUID userId);
    void deleteAllByOpportunityIdAndUserIdAndReminderType(UUID opportunityId, UUID userId, String reminderType);
}
