package com.epsi.narco.integration;

import com.epsi.narco.Controller.PaymentCbController;
import com.epsi.narco.Entity.PaymentCb;
import com.epsi.narco.Entity.User;
import com.epsi.narco.Repository.PaymentCbRepository;
import com.epsi.narco.Repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(PaymentCbController.class)
class PaymentCbControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentCbRepository paymentCbRepository;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User user;
    private PaymentCb card;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1);
        user.setUsername("alice");
        user.setPassword("pwd");
        user.setRole("USER");

        card = new PaymentCb();
        card.setId(1L);
        card.setCodeCb(1234567890123456L);
        card.setCcv((short) 123);
        card.setExpiryDate("12/28");
        card.setIdUsers(user);
    }

    @Test
    void getCardsByUser_shouldReturnList() throws Exception {
        when(paymentCbRepository.findAll()).thenReturn(List.of(card));

        mockMvc.perform(get("/api/cards/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].expiryDate").value("12/28"));
    }

    @Test
    void addCard_shouldReturn201_whenUserExists() throws Exception {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(paymentCbRepository.save(any(PaymentCb.class))).thenReturn(card);

        Map<String, Object> payload = Map.of(
                "userId", 1,
                "codeCb", 1234567890123456L,
                "ccv", 123,
                "expiryDate", "12/28"
        );

        mockMvc.perform(post("/api/cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.expiryDate").value("12/28"));
    }

    @Test
    void addCard_shouldReturn404_whenUserNotFound() throws Exception {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        Map<String, Object> payload = Map.of("userId", 99, "codeCb", 123L, "ccv", 123, "expiryDate", "12/28");

        mockMvc.perform(post("/api/cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateCard_shouldReturn200_whenCardExists() throws Exception {
        when(paymentCbRepository.findById(1L)).thenReturn(Optional.of(card));
        when(paymentCbRepository.save(any(PaymentCb.class))).thenReturn(card);

        mockMvc.perform(put("/api/cards/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("expiryDate", "01/30"))))
                .andExpect(status().isOk());
    }

    @Test
    void updateCard_shouldReturn404_whenCardNotFound() throws Exception {
        when(paymentCbRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/cards/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("expiryDate", "01/30"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteCard_shouldReturn200_whenExists() throws Exception {
        when(paymentCbRepository.existsById(1L)).thenReturn(true);
        doNothing().when(paymentCbRepository).deleteById(1L);

        mockMvc.perform(delete("/api/cards/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void deleteCard_shouldReturn404_whenNotFound() throws Exception {
        when(paymentCbRepository.existsById(99L)).thenReturn(false);

        mockMvc.perform(delete("/api/cards/99"))
                .andExpect(status().isNotFound());
    }
}

