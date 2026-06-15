package com.interviewflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

/**
 * JPA Auditing configuration.
 *
 * AuditorAware supplies the current userId to @CreatedBy / @LastModifiedBy fields.
 * We don't use those fields in this project (we handle ownership explicitly), but
 * registering this bean keeps @EnableJpaAuditing satisfied for @CreatedDate /
 * @LastModifiedDate to work correctly on all entities.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaConfig {

    @Bean
    public AuditorAware<UUID> auditorProvider() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return Optional.empty();
            }
            try {
                return Optional.of(UUID.fromString(auth.getName()));
            } catch (IllegalArgumentException e) {
                return Optional.empty();
            }
        };
    }
}
