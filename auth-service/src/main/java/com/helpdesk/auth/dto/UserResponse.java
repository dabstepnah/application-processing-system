package com.helpdesk.auth.dto;

import com.helpdesk.auth.entity.Role;

import java.time.Instant;

public record UserResponse(
        Long id,
        String username,
        String email,
        Role role,
        boolean banned,
        Instant createdAt
) {
}
