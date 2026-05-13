package com.helpdesk.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTicketRequest(
        @NotBlank(message = "Заголовок обязателен") String title,
        @NotBlank(message = "Текст вопроса обязателен") String description
) {
}