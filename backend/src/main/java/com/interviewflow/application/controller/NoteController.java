package com.interviewflow.application.controller;

import com.interviewflow.application.entity.Note;
import com.interviewflow.application.service.NoteService;
import com.interviewflow.common.response.ApiResponse;
import com.interviewflow.common.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Notes", description = "Manage notes for opportunities")
public class NoteController {

    private final NoteService service;

    @GetMapping("/opportunities/{opportunityId}/notes")
    @Operation(summary = "Get all notes for a specific opportunity")
    public ResponseEntity<ApiResponse<List<Note>>> getNotes(@PathVariable UUID opportunityId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.listNotes(opportunityId, userId)));
    }

    @PostMapping("/opportunities/{opportunityId}/notes")
    @Operation(summary = "Create a note for a specific opportunity")
    public ResponseEntity<ApiResponse<Note>> createNote(
            @PathVariable UUID opportunityId,
            @RequestBody String content) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Note created = service.create(opportunityId, content, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PutMapping("/notes/{id}")
    @Operation(summary = "Update an existing note")
    public ResponseEntity<ApiResponse<Note>> updateNote(
            @PathVariable UUID id,
            @RequestBody String content) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.update(id, content, userId)));
    }

    @DeleteMapping("/notes/{id}")
    @Operation(summary = "Delete a note")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        service.delete(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Note deleted"));
    }
}
