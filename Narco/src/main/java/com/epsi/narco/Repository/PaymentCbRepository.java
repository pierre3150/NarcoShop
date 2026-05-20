package com.epsi.narco.Repository;

import com.epsi.narco.Entity.PaymentCb;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentCbRepository extends JpaRepository<PaymentCb, Long> {
    List<PaymentCb> findByIdUsersId(Integer userId);
}

