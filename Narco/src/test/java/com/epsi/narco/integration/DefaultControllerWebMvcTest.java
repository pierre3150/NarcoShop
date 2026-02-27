package com.epsi.narco.integration;

import com.epsi.narco.Controller.DefaultController;
import com.epsi.narco.Entity.Article;
import com.epsi.narco.Entity.BodyPart;
import com.epsi.narco.Repository.ArticleRepository;
import com.epsi.narco.Repository.BodyPartRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(DefaultController.class)
class DefaultControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ArticleRepository articleRepository;

    @MockBean
    private BodyPartRepository bodyPartRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private BodyPart bodyPart;
    private Article articleDispo;
    private Article articleIndispo;

    @BeforeEach
    void setUp() {
        bodyPart = new BodyPart();
        bodyPart.setId(1);
        bodyPart.setNameBodyPart("Rein gauche");

        articleDispo = new Article();
        articleDispo.setId(1);
        articleDispo.setEtat("Bon état");
        articleDispo.setPrix(new BigDecimal("5000.000"));
        articleDispo.setDisponible(true);
        articleDispo.setIdBodyPart(bodyPart);

        articleIndispo = new Article();
        articleIndispo.setId(2);
        articleIndispo.setEtat("Mauvais état");
        articleIndispo.setPrix(new BigDecimal("100.000"));
        articleIndispo.setDisponible(false);
        articleIndispo.setIdBodyPart(bodyPart);
    }

    @Test
    void getAllArticles_shouldReturnOnlyAvailable() throws Exception {
        when(articleRepository.findAll()).thenReturn(List.of(articleDispo, articleIndispo));

        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].etat").value("Bon état"));
    }

    @Test
    void getArticleById_shouldReturn200_whenFound() throws Exception {
        when(articleRepository.findById(1)).thenReturn(Optional.of(articleDispo));

        mockMvc.perform(get("/api/article/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.etat").value("Bon état"));
    }

    @Test
    void getArticleById_shouldReturn200_whenNotFound() throws Exception {
        when(articleRepository.findById(99)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/article/99"))
                .andExpect(status().isOk());
    }

    @Test
    void createArticle_shouldReturn200_andSave() throws Exception {
        when(articleRepository.save(any(Article.class))).thenReturn(articleDispo);

        mockMvc.perform(post("/api/articles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(articleDispo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.etat").value("Bon état"));

        verify(articleRepository).save(any(Article.class));
    }

    @Test
    void deleteArticle_shouldReturn200_andCallDelete() throws Exception {
        doNothing().when(articleRepository).deleteById(1);

        mockMvc.perform(delete("/api/article/1"))
                .andExpect(status().isOk());

        verify(articleRepository).deleteById(1);
    }

    @Test
    void getArticlesByBodyPart_shouldReturnFiltered() throws Exception {
        when(articleRepository.findByIdBodyPartId(1)).thenReturn(List.of(articleDispo));

        mockMvc.perform(get("/api/articles/bodyPart/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].etat").value("Bon état"));
    }

    @Test
    void getAllBodyParts_shouldReturnList() throws Exception {
        when(bodyPartRepository.findAll()).thenReturn(List.of(bodyPart));

        mockMvc.perform(get("/api/bodyParts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nameBodyPart").value("Rein gauche"));
    }

    @Test
    void getBodyPartById_shouldReturn200_whenFound() throws Exception {
        when(bodyPartRepository.findById(1)).thenReturn(Optional.of(bodyPart));

        mockMvc.perform(get("/api/bodyPart/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nameBodyPart").value("Rein gauche"));
    }

    @Test
    void createBodyPart_shouldReturn200_andSave() throws Exception {
        when(bodyPartRepository.save(any(BodyPart.class))).thenReturn(bodyPart);

        mockMvc.perform(post("/api/bodyParts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bodyPart)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nameBodyPart").value("Rein gauche"));

        verify(bodyPartRepository).save(any(BodyPart.class));
    }

    @Test
    void deleteBodyPart_shouldReturn200_andCallDelete() throws Exception {
        doNothing().when(bodyPartRepository).deleteById(1);

        mockMvc.perform(delete("/api/bodyPart/1"))
                .andExpect(status().isOk());

        verify(bodyPartRepository).deleteById(1);
    }
}

