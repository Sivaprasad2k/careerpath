package com.interviewflow.application.service;

import com.interviewflow.application.entity.Note;
import com.interviewflow.application.repository.NoteRepository;
import com.interviewflow.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository repository;

    @Transactional(readOnly = true)
    public List<Note> listNotes(UUID opportunityId, UUID userId) {
        return repository.findAllByOpportunityIdAndUserIdOrderByCreatedAtDesc(opportunityId, userId);
    }

    @Transactional
    public Note create(UUID opportunityId, String content, UUID userId) {
        Note note = Note.builder()
                .opportunityId(opportunityId)
                .userId(userId)
                .content(content)
                .build();
        return repository.save(note);
    }

    @Transactional
    public Note update(UUID noteId, String content, UUID userId) {
        Note note = repository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));
        note.setContent(content);
        return repository.save(note);
    }

    @Transactional
    public void delete(UUID noteId, UUID userId) {
        Note note = repository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));
        repository.delete(note);
    }
}
