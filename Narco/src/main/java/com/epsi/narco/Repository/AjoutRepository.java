package com.epsi.narco.Repository;

import com.epsi.narco.Entity.Ajout;
import com.epsi.narco.Entity.AjoutId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AjoutRepository extends JpaRepository<Ajout, AjoutId> {
    List<Ajout> findByIdCartId(Integer cartId);
}

