package com.epsi.narco.unit;

import com.epsi.narco.Controller.DefaultController;
import com.epsi.narco.Entity.Article;
import com.epsi.narco.Entity.BodyPart;
import com.epsi.narco.Repository.ArticleRepository;
import com.epsi.narco.Repository.BodyPartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DefaultControllerTest {

    @Mock
    private ArticleRepository articleRepository;

    @Mock
    private BodyPartRepository bodyPartRepository;

    @InjectMocks
    private DefaultController defaultController;

    private BodyPart bodyPart;
    private Article article;

    @BeforeEach
    void setUp() {
        bodyPart = new BodyPart();
        bodyPart.setId(1);
        bodyPart.setNameBodyPart("Rein gauche");

        article = new Article();
        article.setId(1);
        article.setEtat("Bon état");
        article.setDescription("Rein en bonne santé");
        article.setPrix(new BigDecimal("5000.00"));
        article.setDisponible(true);
        article.setIdBodyPart(bodyPart);
    }

    @Test
    void getAllArticles_shouldReturnOnlyAvailableArticles() {
        Article unavailable = new Article();
        unavailable.setId(2);
        unavailable.setDisponible(false);
        unavailable.setIdBodyPart(bodyPart);

        when(articleRepository.findAll()).thenReturn(List.of(article, unavailable));

        List<Article> result = defaultController.getAllArticles();

        assertEquals(1, result.size());
        assertTrue(result.get(0).getDisponible());
    }

    @Test
    void getArticleById_shouldReturnArticle_whenFound() {
        when(articleRepository.findById(1)).thenReturn(Optional.of(article));

        Optional<Article> result = defaultController.getArticleById(1);

        assertTrue(result.isPresent());
        assertEquals("Bon état", result.get().getEtat());
    }

    @Test
    void createArticle_shouldSaveAndReturn() {
        when(articleRepository.save(any(Article.class))).thenReturn(article);

        Article result = defaultController.createArticle(article);

        assertNotNull(result);
        assertEquals(1, result.getId());
        verify(articleRepository).save(article);
    }

    @Test
    void updateArticle_shouldSetIdAndSave() {
        when(articleRepository.save(any(Article.class))).thenReturn(article);

        Article result = defaultController.updateArticle(1, article);

        assertEquals(1, result.getId());
        verify(articleRepository).save(article);
    }

    @Test
    void deleteArticle_shouldCallDeleteById() {
        doNothing().when(articleRepository).deleteById(1);

        defaultController.deleteArticle(1);

        verify(articleRepository).deleteById(1);
    }

    @Test
    void getArticlesByBodyPartId_shouldReturnFilteredArticles() {
        when(articleRepository.findByIdBodyPartId(1)).thenReturn(List.of(article));

        List<Article> result = defaultController.getArticlesByBodyPartId(1);

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getIdBodyPart().getId());
    }

    @Test
    void getAllBodyParts_shouldReturnList() {
        when(bodyPartRepository.findAll()).thenReturn(List.of(bodyPart));

        List<BodyPart> result = defaultController.getAllBodyParts();

        assertEquals(1, result.size());
        assertEquals("Rein gauche", result.get(0).getNameBodyPart());
    }

    @Test
    void createBodyPart_shouldSaveAndReturn() {
        when(bodyPartRepository.save(any(BodyPart.class))).thenReturn(bodyPart);

        BodyPart result = defaultController.createBodyPart(bodyPart);

        assertNotNull(result);
        assertEquals("Rein gauche", result.getNameBodyPart());
    }

    @Test
    void deleteBodyPart_shouldCallDeleteById() {
        doNothing().when(bodyPartRepository).deleteById(1);

        defaultController.deleteBodyPart(1);

        verify(bodyPartRepository).deleteById(1);
    }
}

