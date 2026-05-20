package com.epsi.narco.Service;

import com.epsi.narco.Entity.*;
import com.epsi.narco.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired private UserRepository userRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private PaymentCbRepository paymentCbRepository;
    @Autowired private AjoutRepository ajoutRepository;
    @Autowired private ArticleRepository articleRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public long getOrderCountByUser(Integer userId) {
        return cartRepository.findByIdUsersIdAndDateAchatIsNotNullOrderByDateAchatDesc(userId).size();
    }

    public long getCardCountByUser(Integer userId) {
        return paymentCbRepository.findByIdUsersId(userId).size();
    }

    public List<Cart> getAllOrders() {
        return cartRepository.findByDateAchatIsNotNullOrderByDateAchatDesc();
    }

    public Cart updateOrderStatus(Integer orderId, String newStatus) {
        if (!List.of("PENDING", "PREPARING", "DELIVERED", "COMPLETED").contains(newStatus)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide");
        }
        Cart order = cartRepository.findById(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Commande non trouvée"));
        order.setStatus(newStatus);
        return cartRepository.save(order);
    }

    public Map<String, Object> getStats() {
        List<Cart> allOrders = cartRepository.findByDateAchatIsNotNullOrderByDateAchatDesc();
        double revenue = allOrders.stream().mapToDouble(c -> {
            try { return Double.parseDouble(c.getPrixTotal() != null ? c.getPrixTotal() : "0"); } catch (Exception e) { return 0; }
        }).sum();

        Map<String, Long> byStatus = new HashMap<>();
        for (String s : List.of("PENDING", "PREPARING", "DELIVERED", "COMPLETED")) {
            byStatus.put(s, allOrders.stream().filter(c -> s.equals(c.getStatus())).count());
        }

        return Map.of(
            "totalUsers", userRepository.count(),
            "totalOrders", (long) allOrders.size(),
            "totalRevenue", String.format("%.2f", revenue),
            "ordersByStatus", byStatus
        );
    }

    public List<Map<String, Object>> buildOrderItems(Integer cartId) {
        List<Map<String, Object>> items = new ArrayList<>();
        for (Ajout ajout : ajoutRepository.findByIdCartId(cartId)) {
            articleRepository.findByIdBodyPartId(ajout.getIdBodyPart().getId()).stream()
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

