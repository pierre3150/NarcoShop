package com.epsi.narco.Controller;

import com.epsi.narco.Entity.PaymentCb;
import com.epsi.narco.Entity.User;
import com.epsi.narco.Repository.PaymentCbRepository;
import com.epsi.narco.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true")
public class PaymentCbController {

    @Autowired
    private PaymentCbRepository paymentCbRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCardsByUserId(@PathVariable Integer userId) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (PaymentCb card : paymentCbRepository.findAll().stream()
                .filter(c -> c.getIdUsers().getId().equals(userId)).toList()) {
            result.add(Map.of("id", card.getId(), "codeCb", card.getCodeCb(), "ccv", card.getCcv(), "expiryDate", card.getExpiryDate()));
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> addCard(@RequestBody Map<String, Object> data) {
        Integer userId = (Integer) data.get("userId");
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur non trouvé"));
        }

        PaymentCb card = new PaymentCb();
        Object codeCbObj = data.get("codeCb");
        if (codeCbObj instanceof Integer i) card.setCodeCb(i.longValue());
        else if (codeCbObj instanceof Long l) card.setCodeCb(l);
        else if (codeCbObj instanceof String s) card.setCodeCb(Long.parseLong(s));

        card.setCcv(((Integer) data.get("ccv")).shortValue());
        card.setExpiryDate((String) data.get("expiryDate"));
        card.setIdUsers(userOpt.get());

        PaymentCb saved = paymentCbRepository.save(card);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "id", saved.getId(), "codeCb", saved.getCodeCb(),
            "ccv", saved.getCcv(), "expiryDate", saved.getExpiryDate(),
            "message", "Carte ajoutée avec succès !"
        ));
    }

    @PutMapping("/{cardId}")
    public ResponseEntity<?> updateCard(@PathVariable Long cardId, @RequestBody Map<String, Object> updates) {
        Optional<PaymentCb> cardOpt = paymentCbRepository.findById(cardId);
        if (cardOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Carte non trouvée"));
        }

        PaymentCb card = cardOpt.get();
        if (updates.containsKey("codeCb")) {
            Object o = updates.get("codeCb");
            if (o instanceof Integer i) card.setCodeCb(i.longValue());
            else if (o instanceof Long l) card.setCodeCb(l);
        }
        if (updates.containsKey("ccv")) card.setCcv(((Integer) updates.get("ccv")).shortValue());
        if (updates.containsKey("expiryDate")) card.setExpiryDate((String) updates.get("expiryDate"));

        PaymentCb saved = paymentCbRepository.save(card);
        return ResponseEntity.ok(Map.of(
            "id", saved.getId(), "codeCb", saved.getCodeCb(),
            "ccv", saved.getCcv(), "expiryDate", saved.getExpiryDate(),
            "message", "Carte mise à jour avec succès !"
        ));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<?> deleteCard(@PathVariable Long cardId) {
        if (!paymentCbRepository.existsById(cardId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Carte non trouvée"));
        }
        paymentCbRepository.deleteById(cardId);
        return ResponseEntity.ok(Map.of("message", "Carte supprimée avec succès"));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllCards() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (PaymentCb card : paymentCbRepository.findAll()) {
            result.add(Map.of(
                "id", card.getId(), "codeCb", card.getCodeCb(),
                "ccv", card.getCcv(), "expiryDate", card.getExpiryDate(),
                "userId", card.getIdUsers().getId(), "username", card.getIdUsers().getUsername()
            ));
        }
        return ResponseEntity.ok(result);
    }
}

