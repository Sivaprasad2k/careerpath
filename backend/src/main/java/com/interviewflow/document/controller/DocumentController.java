package com.interviewflow.document.controller;

import com.interviewflow.common.response.ApiResponse;
import com.interviewflow.common.security.SecurityUtils;
import com.interviewflow.document.entity.Document;
import com.interviewflow.document.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Upload resumes, cover letters, and other job-search materials")
public class DocumentController {

    private final DocumentService service;

    @GetMapping("/opportunities/{opportunityId}/documents")
    @Operation(summary = "Get list of documents for an opportunity")
    public ResponseEntity<ApiResponse<List<Document>>> getDocuments(@PathVariable UUID opportunityId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(service.listDocuments(opportunityId, userId)));
    }

    @PostMapping(value = "/opportunities/{opportunityId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document associated with an opportunity")
    public ResponseEntity<ApiResponse<Document>> uploadDocument(
            @PathVariable UUID opportunityId,
            @RequestParam("fileType") String fileType,
            @RequestParam("file") MultipartFile file) throws IOException {

        UUID userId = SecurityUtils.getCurrentUserId();
        Document doc = service.uploadDocument(opportunityId, userId, fileType, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(doc));
    }

    @GetMapping("/documents/{id}/download")
    @Operation(summary = "Download a document")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Document doc = service.getDocument(id, userId);

        File file = new File(doc.getFilePath());
        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/documents/{id}")
    @Operation(summary = "Delete a document")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        service.deleteDocument(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Document deleted"));
    }
}
