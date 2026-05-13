package com.helpdesk.review.security;

// Данные о пользователе из JWT для проверки прав в сервисе репутации.
public record AuthUser(Long userId, String username, String role, boolean banned) {
    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
}
