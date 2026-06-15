package com.interviewflow.reminder.service;

import com.interviewflow.reminder.entity.Reminder;
import com.interviewflow.reminder.repository.ReminderRepository;
import com.interviewflow.common.exception.ResourceNotFoundException;
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
public class ReminderService {

    private final ReminderRepository repository;

    @Transactional(readOnly = true)
    public List<Reminder> listActiveReminders(UUID userId) {
        return repository.findAllByUserIdAndIsDismissedOrderByRemindAtAsc(userId, false);
    }

    @Transactional(readOnly = true)
    public List<Reminder> listRemindersForOpportunity(UUID opportunityId, UUID userId) {
        return repository.findAllByOpportunityIdAndUserId(opportunityId, userId);
    }

    @Transactional
    public Reminder createReminder(UUID opportunityId, UUID userId, String title, String reminderType, Instant remindAt) {
        // Remove existing active reminders of this type for this opportunity
        repository.deleteAllByOpportunityIdAndUserIdAndReminderType(opportunityId, userId, reminderType);

        Reminder reminder = Reminder.builder()
                .opportunityId(opportunityId)
                .userId(userId)
                .title(title)
                .reminderType(reminderType)
                .remindAt(remindAt)
                .build();
        Reminder saved = repository.save(reminder);
        log.info("Reminder scheduled [opportunity={}, type={}]", opportunityId, reminderType);
        return saved;
    }

    @Transactional
    public Reminder dismiss(UUID reminderId, UUID userId) {
        Reminder reminder = repository.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder", "id", reminderId));
        reminder.setDismissed(true);
        return repository.save(reminder);
    }

    @Transactional
    public void deleteReminder(UUID reminderId, UUID userId) {
        repository.findByIdAndUserId(reminderId, userId)
                .ifPresent(repository::delete);
    }
}
