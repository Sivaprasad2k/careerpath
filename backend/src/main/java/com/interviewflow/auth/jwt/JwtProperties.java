package com.interviewflow.auth.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds JWT configuration from application.yml under the "application.jwt" prefix.
 * Using @ConfigurationProperties (rather than @Value) groups related settings
 * and enables validation if needed.
 */
@ConfigurationProperties(prefix = "application.jwt")
public record JwtProperties(
        String secret,
        long accessTokenExpiration,
        long refreshTokenExpiration
) {}
