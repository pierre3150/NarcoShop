package com.epsi.narco.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "cart")
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cart", nullable = false)
    private Integer id;

    @Column(name = "date_creation")
    private Instant dateCreation;

    @Column(name = "prix_total", length = 50)
    private String prixTotal;

    @Column(name = "date_achat")
    private Instant dateAchat;

    @Column(name = "status", length = 50)
    private String status; // PENDING, PREPARING, DELIVERED, COMPLETED

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_users", nullable = false)
    private User idUsers;

}