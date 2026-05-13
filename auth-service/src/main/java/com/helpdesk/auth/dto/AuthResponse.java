package com.helpdesk.auth.dto;

import com.helpdesk.auth.entity.Role;

public record AuthResponse(
        String token,
        Long userId,
        String username,
        Role role
) {
}
