package com.epsi.narco.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "payment_cb")
public class PaymentCb {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_payment_cb", nullable = false)
    private Long id;

    @Column(name = "code_cb")
    private Long codeCb;

    @Column(name = "ccv")
    private Short ccv;

    @Column(name = "expiry_date", length = 50)
    private String expiryDate;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "id_users", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User idUsers;

}

