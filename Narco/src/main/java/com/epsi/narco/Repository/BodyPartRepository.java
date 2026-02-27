package com.epsi.narco.Repository;

import com.epsi.narco.Entity.BodyPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BodyPartRepository extends JpaRepository<BodyPart, Integer> {
}

