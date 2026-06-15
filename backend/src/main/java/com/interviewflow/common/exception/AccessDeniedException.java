package com.interviewflow.common.exception;

/**
 * Thrown when a user tries to access a resource they do not own.
 * Maps to HTTP 403 — distinct from Spring's own AccessDeniedException
 * so we can handle it cleanly in GlobalExceptionHandler.
 */
public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException(String message) {
        super(message);
    }
}
