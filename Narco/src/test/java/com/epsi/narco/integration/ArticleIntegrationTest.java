package com.epsi.narco.integration;

import com.epsi.narco.Entity.Article;
import com.epsi.narco.Entity.BodyPart;
import com.epsi.narco.Repository.ArticleRepository;
import com.epsi.narco.Repository.BodyPartRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ArticleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private BodyPartRepository bodyPartRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private BodyPart bodyPart;

    @BeforeEach
    void setUp() {
        articleRepository.deleteAll();
        bodyPartRepository.deleteAll();

        bodyPart = new BodyPart();
        bodyPart.setNameBodyPart("Rein gauche");
        bodyPartRepository.save(bodyPart);

        Article article1 = new Article();
        article1.setEtat("Bon état");
        article1.setDescription("Rein sain");
        article1.setPrix(new BigDecimal("5000.00"));
        article1.setDisponible(true);
        article1.setIdBodyPart(bodyPart);
        articleRepository.save(article1);

        Article article2 = new Article();
        article2.setEtat("Mauvais état");
        article2.setDescription("Rein abîmé");
        article2.setPrix(new BigDecimal("100.00"));
        article2.setDisponible(false);
        article2.setIdBodyPart(bodyPart);
        articleRepository.save(article2);
    }

    @Test
    void articlesDisponibles() throws Exception {
        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].etat").value("Bon état"));
    }

    @Test
    void articlesParBodyPart() throws Exception {
        mockMvc.perform(get("/api/articles/bodyPart/" + bodyPart.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void listeBodyParts() throws Exception {
        mockMvc.perform(get("/api/bodyParts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nameBodyPart").value("Rein gauche"));
    }

    @Test
    void creerBodyPart() throws Exception {
        BodyPart newBp = new BodyPart();
        newBp.setNameBodyPart("Foie");

        mockMvc.perform(post("/api/bodyParts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newBp)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nameBodyPart").value("Foie"));
    }

    @Test
    void supprimerBodyPart() throws Exception {
        articleRepository.deleteAll();

        mockMvc.perform(delete("/api/bodyPart/" + bodyPart.getId()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/bodyParts"))
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
