package com.epsi.narco.unit;

import com.epsi.narco.Controller.UserController;
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

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserController userController;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1);
        user.setUsername("alice");
        user.setPassword("secret");
        user.setAdresse("5 avenue des tests");
        user.setRole("USER");
    }

    @Test
    void getUserById_shouldReturnUser_whenFound() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        ResponseEntity<?> response = userController.getUserById(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals("alice", body.get("username"));
        assertFalse(body.containsKey("password"), "Le mot de passe ne doit pas être exposé");
    }

    @Test
    void getUserById_shouldReturn404_whenNotFound() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        ResponseEntity<?> response = userController.getUserById(99);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void getAllUsers_shouldReturnListOfUsers() {
        User user2 = new User();
        user2.setId(2);
        user2.setUsername("bob");
        user2.setAdresse("10 rue bob");
        user2.setRole("USER");

        when(userRepository.findAll()).thenReturn(List.of(user, user2));

        ResponseEntity<?> response = userController.getAllUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<?> body = (List<?>) response.getBody();
        assertEquals(2, body.size());
    }

    @Test
    void updateUser_shouldUpdateAdresse() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        Map<String, String> updates = Map.of("adresse", "Nouvelle adresse");
        ResponseEntity<?> response = userController.updateUser(1, updates);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateUser_shouldReturn404_whenUserNotFound() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        ResponseEntity<?> response = userController.updateUser(99, Map.of("adresse", "test"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deleteUser_shouldDelete_whenUserExists() {
        when(userRepository.existsById(1)).thenReturn(true);
        doNothing().when(userRepository).deleteById(1);

        ResponseEntity<?> response = userController.deleteUser(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepository).deleteById(1);
    }

    @Test
    void deleteUser_shouldReturn404_whenUserNotFound() {
        when(userRepository.existsById(99)).thenReturn(false);

        ResponseEntity<?> response = userController.deleteUser(99);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}

