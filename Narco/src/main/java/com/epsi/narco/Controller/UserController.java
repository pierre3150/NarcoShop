package com.epsi.narco.Controller;

import com.epsi.narco.Entity.User;
import com.epsi.narco.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200", allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur non trouvé"));
        }
        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "adresse", user.getAdresse(),
            "role", user.getRole()
        ));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (User user : userRepository.findAll()) {
            result.add(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "adresse", user.getAdresse() != null ? user.getAdresse() : "",
                "role", user.getRole()
            ));
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody Map<String, String> updates) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur non trouvé"));
        }

        User user = userOpt.get();
        if (updates.containsKey("adresse")) user.setAdresse(updates.get("adresse"));
        if (updates.containsKey("password") && !updates.get("password").isEmpty()) {
            user.setPassword(updates.get("password"));
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of(
            "id", saved.getId(),
            "username", saved.getUsername(),
            "adresse", saved.getAdresse(),
            "role", saved.getRole(),
            "message", "Informations mises à jour avec succès !"
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur non trouvé"));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès"));
    }
}
