package com.epsi.narco.Repository;

import com.epsi.narco.Entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Integer> {
    List<Article> findByIdBodyPartId(Integer bodyPartId);
}
