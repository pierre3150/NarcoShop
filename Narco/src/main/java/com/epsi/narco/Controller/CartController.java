package com.epsi.narco.Controller;

import com.epsi.narco.Entity.Cart;
import com.epsi.narco.Service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserCart(@PathVariable Integer userId) {
        Cart activeCart = cartService.getOrCreateActiveCart(userId);
        List<Map<String, Object>> items = cartService.buildCartItems(activeCart.getId());
        return ResponseEntity.ok(Map.of(
            "cartId", activeCart.getId(),
            "items", items,
            "totalPrice", String.format("%.2f", cartService.sumItemPrices(items)),
            "itemCount", items.size(),
            "dateCreation", activeCart.getDateCreation()
        ));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Integer> data) {
        cartService.addToCart(data.get("userId"), data.get("articleId"));
        return ResponseEntity.ok(Map.of("message", "Article ajouté au panier avec succès !"));
    }

    @DeleteMapping("/remove/{cartId}/{bodyPartId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Integer cartId, @PathVariable Integer bodyPartId) {
        cartService.removeFromCart(cartId, bodyPartId);
        return ResponseEntity.ok(Map.of("message", "Article retiré du panier"));
    }

    @DeleteMapping("/clear/{cartId}")
    public ResponseEntity<?> clearCart(@PathVariable Integer cartId) {
        cartService.clearCart(cartId);
        return ResponseEntity.ok(Map.of("message", "Panier vidé avec succès"));
    }

    @PostMapping("/checkout/{cartId}")
    public ResponseEntity<?> checkout(@PathVariable Integer cartId) {
        Cart cart = cartService.checkout(cartId);
        return ResponseEntity.ok(Map.of("message", "Commande validée avec succès !", "orderId", cart.getId()));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getOrderHistory(@PathVariable Integer userId) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Cart order : cartService.getOrderHistory(userId)) {
            List<Map<String, Object>> items = cartService.buildCartItems(order.getId());
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("orderId", order.getId());
            orderMap.put("orderDate", order.getDateAchat());
            orderMap.put("creationDate", order.getDateCreation());
            orderMap.put("status", order.getStatus() != null ? order.getStatus() : "PENDING");
            orderMap.put("items", items);
            orderMap.put("totalPrice", String.format("%.2f", cartService.sumItemPrices(items)));
            orderMap.put("itemCount", items.size());
            result.add(orderMap);
        }
        return ResponseEntity.ok(result);
    }
}
