package com.helpdesk.ticket.security;

// Сводные данные о пользователе из JWT для авторизации и бизнес-правил.
public record AuthUser(Long userId, String username, String role, boolean banned) {
    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }
}