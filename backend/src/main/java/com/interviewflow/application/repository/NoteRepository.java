package com.interviewflow.application.repository;

import com.interviewflow.application.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findAllByOpportunityIdAndUserIdOrderByCreatedAtDesc(UUID opportunityId, UUID userId);
    Optional<Note> findByIdAndUserId(UUID id, UUID userId);
}
