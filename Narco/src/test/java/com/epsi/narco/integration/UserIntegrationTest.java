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
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User user = new User();
        user.setUsername("alice");
        user.setPassword("secret");
        user.setAdresse("5 avenue des tests");
        user.setRole("USER");
        userRepository.save(user);
    }

    @Test
    void listeUsers() throws Exception {
        mockMvc.perform(get("/api/users/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].username").value("alice"));
    }

    @Test
    void userParId() throws Exception {
        User saved = userRepository.findByUsername("alice").orElseThrow();

        mockMvc.perform(get("/api/users/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void userInexistant() throws Exception {
        mockMvc.perform(get("/api/users/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void modifierUser() throws Exception {
        User saved = userRepository.findByUsername("alice").orElseThrow();

        mockMvc.perform(put("/api/users/" + saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("adresse", "Nouvelle adresse"))))
                .andExpect(status().isOk());
    }

    @Test
    void supprimerUser() throws Exception {
        User saved = userRepository.findByUsername("alice").orElseThrow();

        mockMvc.perform(delete("/api/users/" + saved.getId()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/users/" + saved.getId()))
                .andExpect(status().isNotFound());
    }
}
