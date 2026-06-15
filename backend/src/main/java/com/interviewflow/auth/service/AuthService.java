package com.interviewflow.auth.service;

import com.interviewflow.auth.dto.AuthResponse;
import com.interviewflow.auth.dto.LoginRequest;
import com.interviewflow.auth.dto.RefreshTokenRequest;
import com.interviewflow.auth.dto.RegisterRequest;
import com.interviewflow.auth.entity.User;
import com.interviewflow.auth.jwt.JwtService;
import com.interviewflow.auth.repository.UserRepository;
import com.interviewflow.common.exception.DuplicateResourceException;
import com.interviewflow.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Registers a new user.
     * Validates email uniqueness before persisting.
     * Password is hashed with BCrypt — never stored in plain text.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException(
                    "An account with email '" + request.email() + "' already exists"
            );
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email().toLowerCase().trim())
                .password(passwordEncoder.encode(request.password()))
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: {}", saved.getId());

        return buildAuthResponse(saved);
    }

    /**
     * Authenticates a user with email/password.
     * We intentionally return the same error message for "user not found"
     * and "wrong password" to prevent user enumeration.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    /**
     * Issues a new access token given a valid refresh token.
     * Validates the refresh token is not expired and is of type "refresh".
     */
    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();

        if (!jwtService.isTokenValid(refreshToken)) {
            throw new BadCredentialsException("Refresh token is invalid or expired");
        }

        UUID userId = jwtService.extractUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String newAccessToken = jwtService.generateAccessToken(user.getId());
        String newRefreshToken = jwtService.generateRefreshToken(user.getId());

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                newAccessToken,
                newRefreshToken
        );
    }

    private AuthResponse buildAuthResponse(User user) {
        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                jwtService.generateAccessToken(user.getId()),
                jwtService.generateRefreshToken(user.getId())
        );
    }
}
