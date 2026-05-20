package com.epsi.narco.Controller;

import com.epsi.narco.Entity.PaymentCb;
import com.epsi.narco.Service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
public class PaymentCbController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCardsByUserId(@PathVariable Integer userId) {
        List<Map<String, Object>> result = paymentService.getCardsByUserId(userId).stream()
            .map(card -> Map.<String, Object>of(
                "id", card.getId(), "codeCb", card.getCodeCb(),
                "ccv", card.getCcv(), "expiryDate", card.getExpiryDate()
            )).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> addCard(@RequestBody Map<String, Object> data) {
        PaymentCb saved = paymentService.addCard((Integer) data.get("userId"), data);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "id", saved.getId(), "codeCb", saved.getCodeCb(),
            "ccv", saved.getCcv(), "expiryDate", saved.getExpiryDate(),
            "message", "Carte ajoutée avec succès !"
        ));
    }

    @PutMapping("/{cardId}")
    public ResponseEntity<?> updateCard(@PathVariable Long cardId, @RequestBody Map<String, Object> updates) {
        PaymentCb saved = paymentService.updateCard(cardId, updates);
        return ResponseEntity.ok(Map.of(
            "id", saved.getId(), "codeCb", saved.getCodeCb(),
            "ccv", saved.getCcv(), "expiryDate", saved.getExpiryDate(),
            "message", "Carte mise à jour avec succès !"
        ));
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<?> deleteCard(@PathVariable Long cardId) {
        paymentService.deleteCard(cardId);
        return ResponseEntity.ok(Map.of("message", "Carte supprimée avec succès"));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllCards() {
        List<Map<String, Object>> result = paymentService.getAllCards().stream()
            .map(card -> Map.<String, Object>of(
                "id", card.getId(), "codeCb", card.getCodeCb(),
                "ccv", card.getCcv(), "expiryDate", card.getExpiryDate(),
                "userId", card.getIdUsers().getId(), "username", card.getIdUsers().getUsername()
            )).toList();
        return ResponseEntity.ok(result);
    }
}
