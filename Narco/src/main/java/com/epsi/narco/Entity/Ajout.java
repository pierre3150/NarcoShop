package com.epsi.narco.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "ajout")
public class Ajout {
    @EmbeddedId
    private AjoutId id;

    @MapsId("idBodyPart")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_body_part", nullable = false)
    private BodyPart idBodyPart;

    @MapsId("idCart")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cart", nullable = false)
    private Cart idCart;

    @Column(name = "date_ajout")
    private Instant dateAjout;

}