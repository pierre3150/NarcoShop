package com.epsi.narco.Controller;

import com.epsi.narco.Entity.User;
import com.epsi.narco.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        User user = userService.getById(id);
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "adresse", user.getAdresse(),
            "role", user.getRole()
        ));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        List<Map<String, Object>> result = userService.getAll().stream()
            .map(user -> Map.<String, Object>of(
                "id", user.getId(),
                "username", user.getUsername(),
                "adresse", user.getAdresse() != null ? user.getAdresse() : "",
                "role", user.getRole()
            )).toList();
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody Map<String, String> updates) {
        User saved = userService.update(id, updates);
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
        userService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès"));
    }
}
