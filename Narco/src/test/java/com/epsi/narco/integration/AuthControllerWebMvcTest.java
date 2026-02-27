package com.epsi.narco.integration;

import com.epsi.narco.Controller.AuthController;
import com.epsi.narco.Entity.User;
import com.epsi.narco.Repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User buildUser(int id, String username, String password) {
        User u = new User();
        u.setId(id);
        u.setUsername(username);
        u.setPassword(password);
        u.setAdresse("1 rue test");
        u.setRole("USER");
        return u;
    }

    @Test
    void register_shouldReturn201_whenUsernameAvailable() throws Exception {
        User saved = buildUser(1, "newuser", "pass");
        when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(saved);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("username", "newuser", "password", "pass", "adresse", "1 rue test"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void register_shouldReturn409_whenUsernameTaken() throws Exception {
        when(userRepository.findByUsername("taken")).thenReturn(Optional.of(buildUser(1, "taken", "pwd")));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("username", "taken", "password", "pwd", "adresse", ""))))
                .andExpect(status().isConflict());
    }

    @Test
    void login_shouldReturn200_whenCredentialsCorrect() throws Exception {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(buildUser(1, "alice", "secret")));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", "alice", "password", "secret"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("alice"));
    }

    @Test
    void login_shouldReturn401_whenPasswordWrong() throws Exception {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(buildUser(1, "alice", "secret")));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", "alice", "password", "wrong"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_shouldReturn401_whenUserNotFound() throws Exception {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", "ghost", "password", "pwd"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void checkUsername_shouldReturnTrue_whenUserExists() throws Exception {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(buildUser(1, "alice", "pwd")));

        mockMvc.perform(get("/api/auth/check/alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true));
    }

    @Test
    void checkUsername_shouldReturnFalse_whenUserNotFound() throws Exception {
        when(userRepository.findByUsername("nobody")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/auth/check/nobody"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(false));
    }
}

