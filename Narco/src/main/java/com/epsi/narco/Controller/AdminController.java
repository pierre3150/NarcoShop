package com.epsi.narco.Controller;

import com.epsi.narco.Entity.*;
import com.epsi.narco.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private PaymentCbRepository paymentCbRepository;
    @Autowired
    private AjoutRepository ajoutRepository;
    @Autowired
    private ArticleRepository articleRepository;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (User user : userRepository.findAll()) {
            long orderCount = cartRepository.findAll().stream()
                .filter(c -> c.getIdUsers().getId().equals(user.getId()) && c.getDateAchat() != null).count();
            long cardCount = paymentCbRepository.findAll().stream()
                .filter(c -> c.getIdUsers().getId().equals(user.getId())).count();
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("username", user.getUsername());
            map.put("adresse", user.getAdresse());
            map.put("role", user.getRole());
            map.put("orderCount", orderCount);
            map.put("cardCount", cardCount);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Cart> orders = cartRepository.findAll().stream()
            .filter(c -> c.getDateAchat() != null)
            .sorted((a, b) -> b.getDateAchat().compareTo(a.getDateAchat()))
            .toList();

        for (Cart order : orders) {
            List<Map<String, Object>> items = buildItems(order.getId());
            double total = items.stream().mapToDouble(i -> {
                try { return Double.parseDouble((String) i.get("price")); } catch (Exception e) { return 0; }
            }).sum();

            Map<String, Object> map = new HashMap<>();
            map.put("orderId", order.getId());
            map.put("orderDate", order.getDateAchat());
            map.put("userId", order.getIdUsers().getId());
            map.put("username", order.getIdUsers().getUsername());
            map.put("userAddress", order.getIdUsers().getAdresse());
            map.put("status", order.getStatus() != null ? order.getStatus() : "PENDING");
            map.put("items", items);
            map.put("totalPrice", String.format("%.2f", total));
            map.put("itemCount", items.size());
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/order/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Integer orderId, @RequestBody Map<String, String> data) {
        Optional<Cart> orderOpt = cartRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Commande non trouvée"));
        }

        String newStatus = data.get("status");
        if (!List.of("PENDING", "PREPARING", "DELIVERED", "COMPLETED").contains(newStatus)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Statut invalide"));
        }

        Cart order = orderOpt.get();
        order.setStatus(newStatus);
        cartRepository.save(order);
        return ResponseEntity.ok(Map.of("message", "Statut mis à jour", "orderId", orderId, "newStatus", newStatus));
    }

    @GetMapping("/user/{userId}/cards")
    public ResponseEntity<?> getUserCards(@PathVariable Integer userId) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (PaymentCb card : paymentCbRepository.findAll().stream()
                .filter(c -> c.getIdUsers().getId().equals(userId)).toList()) {
            result.add(Map.of("id", card.getId(), "codeCb", card.getCodeCb(), "ccv", card.getCcv(), "expiryDate", card.getExpiryDate()));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        List<Cart> allOrders = cartRepository.findAll().stream().filter(c -> c.getDateAchat() != null).toList();

        double revenue = allOrders.stream().mapToDouble(c -> {
            try { return Double.parseDouble(c.getPrixTotal() != null ? c.getPrixTotal() : "0"); } catch (Exception e) { return 0; }
        }).sum();

        Map<String, Long> byStatus = new HashMap<>();
        for (String s : List.of("PENDING", "PREPARING", "DELIVERED", "COMPLETED")) {
            byStatus.put(s, allOrders.stream().filter(c -> s.equals(c.getStatus())).count());
        }

        return ResponseEntity.ok(Map.of(
            "totalUsers", userRepository.count(),
            "totalOrders", (long) allOrders.size(),
            "totalRevenue", String.format("%.2f", revenue),
            "ordersByStatus", byStatus
        ));
    }

    private List<Map<String, Object>> buildItems(Integer cartId) {
        List<Map<String, Object>> items = new ArrayList<>();
        for (Ajout ajout : ajoutRepository.findAll().stream()
                .filter(a -> a.getIdCart().getId().equals(cartId)).toList()) {
            articleRepository.findAll().stream()
                .filter(a -> a.getIdBodyPart() != null && a.getIdBodyPart().getId().equals(ajout.getIdBodyPart().getId()))
                .findFirst().ifPresent(article -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("bodyPartName", ajout.getIdBodyPart().getNameBodyPart());
                    item.put("articleName", ajout.getIdBodyPart().getNameBodyPart() + " - " + article.getEtat());
                    item.put("price", article.getPrix() != null ? article.getPrix().toString() : "0");
                    item.put("state", article.getEtat());
                    items.add(item);
                });
        }
        return items;
    }
}
