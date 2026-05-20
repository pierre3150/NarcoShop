package com.epsi.narco.Controller;

import com.epsi.narco.Entity.Cart;
import com.epsi.narco.Entity.User;
import com.epsi.narco.Service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> result = adminService.getAllUsers().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("username", user.getUsername());
            map.put("adresse", user.getAdresse());
            map.put("role", user.getRole());
            map.put("orderCount", adminService.getOrderCountByUser(user.getId()));
            map.put("cardCount", adminService.getCardCountByUser(user.getId()));
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Cart order : adminService.getAllOrders()) {
            List<Map<String, Object>> items = adminService.buildOrderItems(order.getId());
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
        Cart order = adminService.updateOrderStatus(orderId, data.get("status"));
        return ResponseEntity.ok(Map.of("message", "Statut mis à jour", "orderId", orderId, "newStatus", order.getStatus()));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }
}
