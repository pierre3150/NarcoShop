package com.epsi.narco.Service;

import com.epsi.narco.Entity.PaymentCb;
import com.epsi.narco.Entity.User;
import com.epsi.narco.Repository.PaymentCbRepository;
import com.epsi.narco.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired
    private PaymentCbRepository paymentCbRepository;

    @Autowired
    private UserRepository userRepository;

    public List<PaymentCb> getCardsByUserId(Integer userId) {
        return paymentCbRepository.findByIdUsersId(userId);
    }

    public List<PaymentCb> getAllCards() {
        return paymentCbRepository.findAll();
    }

    public PaymentCb addCard(Integer userId, Map<String, Object> data) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));

        PaymentCb card = new PaymentCb();
        Object codeCbObj = data.get("codeCb");
        if (codeCbObj instanceof Integer i) card.setCodeCb(i.longValue());
        else if (codeCbObj instanceof Long l) card.setCodeCb(l);
        else if (codeCbObj instanceof String s) card.setCodeCb(Long.parseLong(s));
        card.setCcv(((Integer) data.get("ccv")).shortValue());
        card.setExpiryDate((String) data.get("expiryDate"));
        card.setIdUsers(user);
        return paymentCbRepository.save(card);
    }

    public PaymentCb updateCard(Long cardId, Map<String, Object> updates) {
        PaymentCb card = paymentCbRepository.findById(cardId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carte non trouvée"));

        if (updates.containsKey("codeCb")) {
            Object o = updates.get("codeCb");
            if (o instanceof Integer i) card.setCodeCb(i.longValue());
            else if (o instanceof Long l) card.setCodeCb(l);
        }
        if (updates.containsKey("ccv")) card.setCcv(((Integer) updates.get("ccv")).shortValue());
        if (updates.containsKey("expiryDate")) card.setExpiryDate((String) updates.get("expiryDate"));
        return paymentCbRepository.save(card);
    }

    public void deleteCard(Long cardId) {
        if (!paymentCbRepository.existsById(cardId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Carte non trouvée");
        }
        paymentCbRepository.deleteById(cardId);
    }
}

