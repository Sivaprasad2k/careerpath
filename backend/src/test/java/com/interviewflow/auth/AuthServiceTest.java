package com.interviewflow.auth;

import com.interviewflow.auth.dto.LoginRequest;
import com.interviewflow.auth.dto.RegisterRequest;
import com.interviewflow.auth.entity.User;
import com.interviewflow.auth.jwt.JwtService;
import com.interviewflow.auth.repository.UserRepository;
import com.interviewflow.auth.service.AuthService;
import com.interviewflow.common.exception.DuplicateResourceException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;

    @InjectMocks AuthService authService;

    @Test
    @DisplayName("register: throws DuplicateResourceException when email already exists")
    void register_duplicateEmail_throws() {
        given(userRepository.existsByEmail("john@example.com")).willReturn(true);

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("John", "john@example.com", "password123")))
                .isInstanceOf(DuplicateResourceException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("register: saves user with hashed password")
    void register_success_savesHashedPassword() {
        given(userRepository.existsByEmail(any())).willReturn(false);
        given(passwordEncoder.encode("password123")).willReturn("hashed_pw");
        given(jwtService.generateAccessToken(any())).willReturn("access_token");
        given(jwtService.generateRefreshToken(any())).willReturn("refresh_token");

        User savedUser = User.builder().id(UUID.randomUUID())
                .name("John").email("john@example.com").password("hashed_pw").build();
        given(userRepository.save(any(User.class))).willReturn(savedUser);

        var response = authService.register(
                new RegisterRequest("John", "john@example.com", "password123"));

        assertThat(response.email()).isEqualTo("john@example.com");
        assertThat(response.accessToken()).isEqualTo("access_token");
    }

    @Test
    @DisplayName("login: throws BadCredentialsException for unknown email")
    void login_unknownEmail_throws() {
        given(userRepository.findByEmail(any())).willReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(
                new LoginRequest("nobody@example.com", "password")))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("login: throws BadCredentialsException for wrong password")
    void login_wrongPassword_throws() {
        User user = User.builder().id(UUID.randomUUID())
                .email("john@example.com").password("hashed").build();
        given(userRepository.findByEmail("john@example.com")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("wrongpassword", "hashed")).willReturn(false);

        assertThatThrownBy(() -> authService.login(
                new LoginRequest("john@example.com", "wrongpassword")))
                .isInstanceOf(BadCredentialsException.class);
    }
}
