package com.interviewflow.document.service;

import com.interviewflow.common.exception.ResourceNotFoundException;
import com.interviewflow.document.entity.Document;
import com.interviewflow.document.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository repository;
    private final String uploadDir = "uploads";

    @Transactional(readOnly = true)
    public List<Document> listDocuments(UUID opportunityId, UUID userId) {
        return repository.findAllByOpportunityIdAndUserId(opportunityId, userId);
    }

    @Transactional(readOnly = true)
    public Document getDocument(UUID id, UUID userId) {
        return repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
    }

    @Transactional
    public Document uploadDocument(UUID opportunityId, UUID userId, String fileType, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        // 5MB limit
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 5MB limit");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null) {
            originalFileName = "unnamed";
        }

        String lowercaseName = originalFileName.toLowerCase();
        if (!lowercaseName.endsWith(".pdf") && !lowercaseName.endsWith(".docx") &&
            !lowercaseName.endsWith(".doc") && !lowercaseName.endsWith(".png") &&
            !lowercaseName.endsWith(".jpg") && !lowercaseName.endsWith(".jpeg")) {
            throw new IllegalArgumentException("File format not supported. Only PDF, DOCX, DOC, PNG, and JPEG are allowed");
        }

        // Ensure upload directory exists inside workspace
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }


        // Generate unique local filename
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
        Path filePath = Paths.get(uploadDir, uniqueFileName);
        Files.copy(file.getInputStream(), filePath);

        Document doc = Document.builder()
                .opportunityId(opportunityId)
                .userId(userId)
                .fileName(originalFileName)
                .fileType(fileType != null ? fileType : "OTHER")
                .fileSize(file.getSize())
                .filePath(filePath.toAbsolutePath().toString())
                .build();

        Document saved = repository.save(doc);
        log.info("Document uploaded [opportunity={}, document={}]", opportunityId, saved.getId());
        return saved;
    }

    @Transactional
    public void deleteDocument(UUID id, UUID userId) {
        Document doc = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));

        // Delete physical file
        try {
            Files.deleteIfExists(Paths.get(doc.getFilePath()));
        } catch (IOException e) {
            log.error("Failed to delete physical file [path={}]", doc.getFilePath(), e);
        }

        repository.delete(doc);
        log.info("Document deleted [id={}]", id);
    }
}
