package com.epsi.narco.Controller;

import com.epsi.narco.Entity.*;
import com.epsi.narco.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true")
public class CartController {

    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ArticleRepository articleRepository;
    @Autowired
    private BodyPartRepository bodyPartRepository;
    @Autowired
    private AjoutRepository ajoutRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserCart(@PathVariable Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur non trouvé"));
        }

        List<Cart> carts = cartRepository.findAll().stream()
            .filter(c -> c.getIdUsers().getId().equals(userId) && c.getDateAchat() == null).toList();

        Cart activeCart;
        if (carts.isEmpty()) {
            activeCart = new Cart();
            activeCart.setIdUsers(userOpt.get());
            activeCart.setDateCreation(Instant.now());
            activeCart.setPrixTotal("0");
            activeCart = cartRepository.save(activeCart);
        } else {
            activeCart = carts.get(0);
        }

        final Integer cartId = activeCart.getId();
        List<Ajout> ajouts = ajoutRepository.findAll().stream()
            .filter(a -> a.getIdCart().getId().equals(cartId)).toList();

        List<Map<String, Object>> items = new ArrayList<>();
        double totalPrice = 0;

        for (Ajout ajout : ajouts) {
            BodyPart bodyPart = ajout.getIdBodyPart();
            Optional<Article> articleOpt = articleRepository.findAll().stream()
                .filter(a -> a.getIdBodyPart() != null && a.getIdBodyPart().getId().equals(bodyPart.getId()))
                .findFirst();
            if (articleOpt.isPresent()) {
                Article article = articleOpt.get();
                Map<String, Object> item = new HashMap<>();
                item.put("bodyPartId", bodyPart.getId());
                item.put("bodyPartName", bodyPart.getNameBodyPart());
                item.put("articleId", article.getId());
                item.put("articleName", bodyPart.getNameBodyPart() + " - " + article.getEtat());
                item.put("price", article.getPrix() != null ? article.getPrix().toString() : "0");
                item.put("state", article.getEtat());
                item.put("dateAjout", ajout.getDateAjout());
                items.add(item);
                if (article.getPrix() != null) totalPrice += article.getPrix().doubleValue();
            }
        }

        return ResponseEntity.ok(Map.of(
            "cartId", activeCart.getId(),
            "items", items,
            "totalPrice", String.format("%.2f", totalPrice),
            "itemCount", items.size(),
            "dateCreation", activeCart.getDateCreation()
        ));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Integer> data) {
        Integer userId = data.get("userId");
        Integer articleId = data.get("articleId");

        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Article> articleOpt = articleRepository.findById(articleId);

        if (userOpt.isEmpty() || articleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur ou article non trouvé"));
        }

        Article article = articleOpt.get();
        if (article.getIdBodyPart() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Article sans partie du corps associée"));
        }

        List<Cart> carts = cartRepository.findAll().stream()
            .filter(c -> c.getIdUsers().getId().equals(userId) && c.getDateAchat() == null).toList();

        Cart activeCart;
        if (carts.isEmpty()) {
            activeCart = new Cart();
            activeCart.setIdUsers(userOpt.get());
            activeCart.setDateCreation(Instant.now());
            activeCart.setPrixTotal("0");
            activeCart = cartRepository.save(activeCart);
        } else {
            activeCart = carts.get(0);
        }

        final Integer activeCartId = activeCart.getId();
        final Integer bodyPartId = article.getIdBodyPart().getId();
        boolean alreadyInCart = ajoutRepository.findAll().stream()
            .anyMatch(a -> a.getIdCart().getId().equals(activeCartId) && a.getIdBodyPart().getId().equals(bodyPartId));

        if (alreadyInCart) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Cet article est déjà dans votre panier"));
        }

        Ajout ajout = new Ajout();
        AjoutId ajoutId = new AjoutId();
        ajoutId.setIdBodyPart(bodyPartId);
        ajoutId.setIdCart(activeCartId);
        ajout.setId(ajoutId);
        ajout.setIdBodyPart(article.getIdBodyPart());
        ajout.setIdCart(activeCart);
        ajout.setDateAjout(Instant.now());
        ajoutRepository.save(ajout);

        return ResponseEntity.ok(Map.of("message", "Article ajouté au panier avec succès !"));
    }

    @DeleteMapping("/remove/{cartId}/{bodyPartId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Integer cartId, @PathVariable Integer bodyPartId) {
        AjoutId ajoutId = new AjoutId();
        ajoutId.setIdCart(cartId);
        ajoutId.setIdBodyPart(bodyPartId);

        Optional<Ajout> ajoutOpt = ajoutRepository.findById(ajoutId);
        if (ajoutOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Article non trouvé dans le panier"));
        }

        ajoutRepository.delete(ajoutOpt.get());
        return ResponseEntity.ok(Map.of("message", "Article retiré du panier"));
    }

    @DeleteMapping("/clear/{cartId}")
    public ResponseEntity<?> clearCart(@PathVariable Integer cartId) {
        List<Ajout> ajouts = ajoutRepository.findAll().stream()
            .filter(a -> a.getIdCart().getId().equals(cartId)).toList();
        ajoutRepository.deleteAll(ajouts);
        return ResponseEntity.ok(Map.of("message", "Panier vidé avec succès"));
    }

    @PostMapping("/checkout/{cartId}")
    public ResponseEntity<?> checkout(@PathVariable Integer cartId) {
        Optional<Cart> cartOpt = cartRepository.findById(cartId);
        if (cartOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Panier non trouvé"));
        }

        Cart cart = cartOpt.get();
        List<Ajout> ajouts = ajoutRepository.findAll().stream()
            .filter(a -> a.getIdCart().getId().equals(cartId)).toList();

        for (Ajout ajout : ajouts) {
            articleRepository.findAll().stream()
                .filter(a -> a.getIdBodyPart() != null && a.getIdBodyPart().getId().equals(ajout.getIdBodyPart().getId()))
                .findFirst().ifPresent(article -> {
                    article.setDisponible(false);
                    articleRepository.save(article);
                });
        }

        cart.setDateAchat(Instant.now());
        cart.setStatus("PENDING");
        cartRepository.save(cart);

        return ResponseEntity.ok(Map.of("message", "Commande validée avec succès !", "orderId", cart.getId()));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getOrderHistory(@PathVariable Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur non trouvé"));
        }

        List<Cart> orders = cartRepository.findAll().stream()
            .filter(c -> c.getIdUsers().getId().equals(userId) && c.getDateAchat() != null)
            .sorted((a, b) -> b.getDateAchat().compareTo(a.getDateAchat()))
            .toList();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Cart order : orders) {
            List<Ajout> ajouts = ajoutRepository.findAll().stream()
                .filter(a -> a.getIdCart().getId().equals(order.getId())).toList();

            List<Map<String, Object>> items = new ArrayList<>();
            double totalPrice = 0;

            for (Ajout ajout : ajouts) {
                BodyPart bodyPart = ajout.getIdBodyPart();
                Optional<Article> articleOpt = articleRepository.findAll().stream()
                    .filter(a -> a.getIdBodyPart() != null && a.getIdBodyPart().getId().equals(bodyPart.getId()))
                    .findFirst();
                if (articleOpt.isPresent()) {
                    Article article = articleOpt.get();
                    Map<String, Object> item = new HashMap<>();
                    item.put("bodyPartId", bodyPart.getId());
                    item.put("bodyPartName", bodyPart.getNameBodyPart());
                    item.put("articleId", article.getId());
                    item.put("articleName", bodyPart.getNameBodyPart() + " - " + article.getEtat());
                    item.put("price", article.getPrix() != null ? article.getPrix().toString() : "0");
                    item.put("state", article.getEtat());
                    items.add(item);
                    if (article.getPrix() != null) totalPrice += article.getPrix().doubleValue();
                }
            }

            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("orderId", order.getId());
            orderMap.put("orderDate", order.getDateAchat());
            orderMap.put("creationDate", order.getDateCreation());
            orderMap.put("status", order.getStatus() != null ? order.getStatus() : "PENDING");
            orderMap.put("items", items);
            orderMap.put("totalPrice", String.format("%.2f", totalPrice));
            orderMap.put("itemCount", items.size());
            result.add(orderMap);
        }

        return ResponseEntity.ok(result);
    }
}
