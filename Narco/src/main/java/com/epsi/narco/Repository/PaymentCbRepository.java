package com.epsi.narco.Repository;

import com.epsi.narco.Entity.PaymentCb;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentCbRepository extends JpaRepository<PaymentCb, Long> {
}

