package com.epsi.narco.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "article")
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_article", nullable = false)
    private Integer id;

    @Column(name = "etat", length = 50)
    private String etat;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

    @Column(name = "prix", precision = 16, scale = 3)
    private BigDecimal prix;

    @Column(name = "date_extraction")
    private Instant dateExtraction;

    @Column(name = "disponible")
    private Boolean disponible = true; // Par défaut disponible

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_body_part", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "articles"})
    private BodyPart idBodyPart;
}