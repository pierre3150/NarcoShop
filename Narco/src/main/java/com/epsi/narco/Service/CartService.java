package com.epsi.narco.Service;

import com.epsi.narco.Entity.*;
import com.epsi.narco.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CartService {

    @Autowired private CartRepository cartRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ArticleRepository articleRepository;
    @Autowired private AjoutRepository ajoutRepository;

    public Cart getOrCreateActiveCart(Integer userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
        List<Cart> carts = cartRepository.findByIdUsersIdAndDateAchatIsNull(userId);
        if (!carts.isEmpty()) return carts.get(0);
        Cart cart = new Cart();
        cart.setIdUsers(user);
        cart.setDateCreation(Instant.now());
        cart.setPrixTotal("0");
        return cartRepository.save(cart);
    }

    public List<Map<String, Object>> buildCartItems(Integer cartId) {
        List<Map<String, Object>> items = new ArrayList<>();
        for (Ajout ajout : ajoutRepository.findByIdCartId(cartId)) {
            BodyPart bodyPart = ajout.getIdBodyPart();
            articleRepository.findByIdBodyPartId(bodyPart.getId()).stream()
                .filter(a -> a.getDisponible() == null || a.getDisponible())
                .findFirst()
                .ifPresent(article -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("bodyPartId", bodyPart.getId());
                    item.put("bodyPartName", bodyPart.getNameBodyPart());
                    item.put("articleId", article.getId());
                    item.put("articleName", bodyPart.getNameBodyPart() + " - " + article.getEtat());
                    item.put("price", article.getPrix() != null ? article.getPrix().toString() : "0");
                    item.put("state", article.getEtat());
                    item.put("dateAjout", ajout.getDateAjout());
                    items.add(item);
                });
        }
        return items;
    }

    public double sumItemPrices(List<Map<String, Object>> items) {
        return items.stream().mapToDouble(i -> {
            try { return Double.parseDouble((String) i.get("price")); } catch (Exception e) { return 0; }
        }).sum();
    }

    public void addToCart(Integer userId, Integer articleId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article non trouvé"));
        if (article.getIdBodyPart() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Article sans partie du corps associée");
        }

        Cart activeCart = getOrCreateActiveCart(userId);
        Integer bodyPartId = article.getIdBodyPart().getId();
        boolean alreadyInCart = ajoutRepository.findByIdCartId(activeCart.getId()).stream()
            .anyMatch(a -> a.getIdBodyPart().getId().equals(bodyPartId));
        if (alreadyInCart) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet article est déjà dans votre panier");
        }

        AjoutId ajoutId = new AjoutId();
        ajoutId.setIdBodyPart(bodyPartId);
        ajoutId.setIdCart(activeCart.getId());
        Ajout ajout = new Ajout();
        ajout.setId(ajoutId);
        ajout.setIdBodyPart(article.getIdBodyPart());
        ajout.setIdCart(activeCart);
        ajout.setDateAjout(Instant.now());
        ajoutRepository.save(ajout);
    }

    public void removeFromCart(Integer cartId, Integer bodyPartId) {
        AjoutId ajoutId = new AjoutId();
        ajoutId.setIdCart(cartId);
        ajoutId.setIdBodyPart(bodyPartId);
        Ajout ajout = ajoutRepository.findById(ajoutId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article non trouvé dans le panier"));
        ajoutRepository.delete(ajout);
    }

    public void clearCart(Integer cartId) {
        ajoutRepository.deleteAll(ajoutRepository.findByIdCartId(cartId));
    }

    public Cart checkout(Integer cartId) {
        Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Panier non trouvé"));
        ajoutRepository.findByIdCartId(cartId).forEach(ajout ->
            articleRepository.findByIdBodyPartId(ajout.getIdBodyPart().getId()).stream()
                .findFirst().ifPresent(article -> {
                    article.setDisponible(false);
                    articleRepository.save(article);
                })
        );
        cart.setDateAchat(Instant.now());
        cart.setStatus("PENDING");
        return cartRepository.save(cart);
    }

    public List<Cart> getOrderHistory(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé");
        }
        return cartRepository.findByIdUsersIdAndDateAchatIsNotNullOrderByDateAchatDesc(userId);
    }
}

