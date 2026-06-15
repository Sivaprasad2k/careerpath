package com.interviewflow.common.security;

import com.interviewflow.common.exception.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Static helper to extract the authenticated user's ID from the SecurityContext.
 *
 * Why a static util instead of injecting Principal:
 * Controllers can pass the ID down to services cleanly, and services
 * can perform ownership checks without needing the HttpServletRequest.
 * The SecurityContext is thread-local and always available within a request.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("No authenticated user in context");
        }

        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException ex) {
            throw new AccessDeniedException("Invalid user identifier in security context");
        }
    }
}
