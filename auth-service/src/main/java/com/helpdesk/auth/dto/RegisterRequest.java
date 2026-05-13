package com.helpdesk.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank(message = "username обязателен") String username,
        @NotBlank(message = "email обязателен") @Email(message = "email некорректный") String email,
        @NotBlank(message = "password обязателен") String password
) {
}
