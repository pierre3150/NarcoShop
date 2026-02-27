package com.epsi.narco.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@Embeddable
public class AjoutId implements Serializable {
    private static final long serialVersionUID = -6882128698445551987L;
    @Column(name = "id_body_part", nullable = false)
    private Integer idBodyPart;

    @Column(name = "id_cart", nullable = false)
    private Integer idCart;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        AjoutId entity = (AjoutId) o;
        return Objects.equals(this.idCart, entity.idCart) &&
                Objects.equals(this.idBodyPart, entity.idBodyPart);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idCart, idBodyPart);
    }

}