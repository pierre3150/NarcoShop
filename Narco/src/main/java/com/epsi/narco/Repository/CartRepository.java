package com.epsi.narco.Repository;

import com.epsi.narco.Entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    List<Cart> findByIdUsersIdOrderByDateCreationDesc(Integer userId);
    List<Cart> findByIdUsersIdAndDateAchatIsNull(Integer userId);
    List<Cart> findByIdUsersIdAndDateAchatIsNotNullOrderByDateAchatDesc(Integer userId);
    List<Cart> findByDateAchatIsNotNullOrderByDateAchatDesc();
}
