package com.epsi.narco.Service;

import com.epsi.narco.Entity.User;
import com.epsi.narco.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public User register(String username, String password, String adresse) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce nom d'utilisateur existe déjà");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setAdresse(adresse);
        user.setRole("USER");
        return userRepository.save(user);
    }

    public User login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nom d'utilisateur ou mot de passe incorrect");
        }
        return userOpt.get();
    }

    public boolean usernameExists(String username) {
        return userRepository.findByUsername(username).isPresent();
    }
}

