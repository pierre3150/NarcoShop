package com.epsi.narco.Service;

import com.epsi.narco.Entity.Cart;
import com.epsi.narco.Entity.User;
import com.epsi.narco.Repository.AjoutRepository;
import com.epsi.narco.Repository.CartRepository;
import com.epsi.narco.Repository.PaymentCbRepository;
import com.epsi.narco.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private AjoutRepository ajoutRepository;

    @Autowired
    private PaymentCbRepository paymentCbRepository;

    public User getById(Integer id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé"));
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public User update(Integer id, Map<String, String> updates) {
        User user = getById(id);
        if (updates.containsKey("adresse")) user.setAdresse(updates.get("adresse"));
        if (updates.containsKey("password") && !updates.get("password").isEmpty()) {
            user.setPassword(updates.get("password"));
        }
        return userRepository.save(user);
    }

    public void delete(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur non trouvé");
        }
        List<Cart> carts = cartRepository.findByIdUsersIdOrderByDateCreationDesc(id);
        carts.forEach(cart -> ajoutRepository.deleteAll(ajoutRepository.findByIdCartId(cart.getId())));
        cartRepository.deleteAll(carts);
        paymentCbRepository.deleteAll(paymentCbRepository.findByIdUsersId(id));
        userRepository.deleteById(id);
    }
}

