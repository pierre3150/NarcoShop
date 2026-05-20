package com.epsi.narco.integration;

import com.epsi.narco.Entity.User;
import com.epsi.narco.Repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void registerOk() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("username", "newuser", "password", "pass123", "adresse", "1 rue test"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void registerUsernameDejaExistant() throws Exception {
        User existing = new User();
        existing.setUsername("taken");
        existing.setPassword("pwd");
        existing.setAdresse("1 rue test");
        userRepository.save(existing);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("username", "taken", "password", "pwd", "adresse", ""))))
                .andExpect(status().isConflict());
    }

    @Test
    void loginOk() throws Exception {
        User user = new User();
        user.setUsername("alice");
        user.setPassword("secret");
        user.setAdresse("1 rue test");
        userRepository.save(user);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", "alice", "password", "secret"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("alice"));
    }

    @Test
    void loginMauvaisMotDePasse() throws Exception {
        User user = new User();
        user.setUsername("bob");
        user.setPassword("correct");
        user.setAdresse("1 rue test");
        userRepository.save(user);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", "bob", "password", "wrong"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginUserInexistant() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", "ghost", "password", "pass"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void checkUsernameExiste() throws Exception {
        User user = new User();
        user.setUsername("john");
        user.setPassword("pwd");
        userRepository.save(user);

        mockMvc.perform(get("/api/auth/check/john"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true));
    }

    @Test
    void checkUsernameExistePas() throws Exception {
        mockMvc.perform(get("/api/auth/check/nobody"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(false));
    }
}
