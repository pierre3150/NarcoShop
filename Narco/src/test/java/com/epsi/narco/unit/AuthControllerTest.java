package com.epsi.narco.unit;

import com.epsi.narco.Controller.AuthController;
import com.epsi.narco.Entity.User;
import com.epsi.narco.Repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthController authController;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1);
        user.setUsername("john");
        user.setPassword("pass123");
        user.setAdresse("123 rue test");
        user.setRole("USER");
    }

    @Test
    void register_shouldCreateUser_whenUsernameNotTaken() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(user);

        Map<String, String> payload = Map.of("username", "john", "password", "pass123", "adresse", "123 rue test");
        ResponseEntity<?> response = authController.register(payload);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("john", body.get("username"));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_shouldReturnConflict_whenUsernameAlreadyExists() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));

        Map<String, String> payload = Map.of("username", "john", "password", "pass123", "adresse", "123 rue test");
        ResponseEntity<?> response = authController.register(payload);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_shouldReturnUser_whenCredentialsAreCorrect() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));

        Map<String, String> payload = Map.of("username", "john", "password", "pass123");
        ResponseEntity<?> response = authController.login(payload);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("john", body.get("username"));
    }

    @Test
    void login_shouldReturnUnauthorized_whenPasswordIsWrong() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));

        Map<String, String> payload = Map.of("username", "john", "password", "wrongpass");
        ResponseEntity<?> response = authController.login(payload);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void login_shouldReturnUnauthorized_whenUserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        Map<String, String> payload = Map.of("username", "unknown", "password", "pass123");
        ResponseEntity<?> response = authController.login(payload);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void checkUsername_shouldReturnTrue_whenUserExists() {
        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));

        ResponseEntity<?> response = authController.checkUsername("john");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(true, body.get("exists"));
    }

    @Test
    void checkUsername_shouldReturnFalse_whenUserDoesNotExist() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.checkUsername("ghost");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(false, body.get("exists"));
    }
}

