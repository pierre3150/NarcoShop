package com.epsi.narco.Controller;

import com.epsi.narco.Entity.User;
import com.epsi.narco.Service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> credentials) {
        User saved = authService.register(
            credentials.get("username"),
            credentials.get("password"),
            credentials.get("adresse")
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "id", saved.getId(),
            "username", saved.getUsername(),
            "adresse", saved.getAdresse(),
            "role", saved.getRole(),
            "message", "Inscription réussie !"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        User user = authService.login(credentials.get("username"), credentials.get("password"));
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "adresse", user.getAdresse(),
            "role", user.getRole(),
            "message", "Connexion réussie !"
        ));
    }

    @GetMapping("/check/{username}")
    public ResponseEntity<?> checkUsername(@PathVariable String username) {
        return ResponseEntity.ok(Map.of("exists", authService.usernameExists(username)));
    }
}
