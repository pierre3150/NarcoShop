package com.epsi.narco.Entity;

public enum UserRole {
    USER("USER"),           // Utilisateur normal
    ADMIN("ADMIN"),         // Administrateur
    MODERATOR("MODERATOR"); // Modérateur (optionnel)

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static UserRole fromString(String role) {
        for (UserRole r : UserRole.values()) {
            if (r.value.equalsIgnoreCase(role)) {
                return r;
            }
        }
        return USER; // Par défaut
    }
}

