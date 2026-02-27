package com.epsi.narco.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "body_part")
public class BodyPart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_body_part", nullable = false)
    private Integer id;

    @Column(name = "name_body_part")
    private String nameBodyPart;

}