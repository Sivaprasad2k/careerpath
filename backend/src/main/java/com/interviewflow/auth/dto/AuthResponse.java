package com.interviewflow.auth.dto;

import java.util.UUID;

/**
 * Returned after successful login or register.
 * Contains both access token (short-lived) and refresh token (long-lived).
 */
public record AuthResponse(
        UUID userId,
        String name,
        String email,
        String accessToken,
        String refreshToken
) {}
