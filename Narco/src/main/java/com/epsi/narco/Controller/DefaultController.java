package com.epsi.narco.Controller;

import com.epsi.narco.Entity.Article;
import com.epsi.narco.Entity.BodyPart;
import com.epsi.narco.Repository.ArticleRepository;
import com.epsi.narco.Repository.BodyPartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class DefaultController {

    @Autowired
    private ArticleRepository articleRepository;
    @Autowired
    private BodyPartRepository bodyPartRepository;

    @GetMapping("/articles")
    public List<Article> getAllArticles() {
        return articleRepository.findAll().stream()
            .filter(a -> a.getDisponible() == null || a.getDisponible()).toList();
    }

    @GetMapping("/article/{id}")
    public Optional<Article> getArticleById(@PathVariable Integer id) {
        return articleRepository.findById(id);
    }

    @PostMapping("/articles")
    public Article createArticle(@RequestBody Article article) {
        return articleRepository.save(article);
    }

    @PutMapping("/article/{id}")
    public Article updateArticle(@PathVariable Integer id, @RequestBody Article article) {
        article.setId(id);
        return articleRepository.save(article);
    }

    @DeleteMapping("/article/{id}")
    public void deleteArticle(@PathVariable Integer id) {
        articleRepository.deleteById(id);
    }

    @GetMapping("/articles/bodyPart/{bodyPartId}")
    public List<Article> getArticlesByBodyPartId(@PathVariable Integer bodyPartId) {
        return articleRepository.findByIdBodyPartId(bodyPartId).stream()
            .filter(a -> a.getDisponible() == null || a.getDisponible()).toList();
    }

    @GetMapping("/bodyParts")
    public List<BodyPart> getAllBodyParts() {
        return bodyPartRepository.findAll();
    }

    @GetMapping("/bodyPart/{id}")
    public Optional<BodyPart> getBodyPartById(@PathVariable Integer id) {
        return bodyPartRepository.findById(id);
    }

    @PostMapping("/bodyParts")
    public BodyPart createBodyPart(@RequestBody BodyPart bodyPart) {
        return bodyPartRepository.save(bodyPart);
    }

    @PutMapping("/bodyPart/{id}")
    public BodyPart updateBodyPart(@PathVariable Integer id, @RequestBody BodyPart bodyPart) {
        bodyPart.setId(id);
        return bodyPartRepository.save(bodyPart);
    }

    @DeleteMapping("/bodyPart/{id}")
    public void deleteBodyPart(@PathVariable Integer id) {
        bodyPartRepository.deleteById(id);
    }
}