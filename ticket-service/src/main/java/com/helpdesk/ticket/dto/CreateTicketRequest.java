package com.helpdesk.ticket.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record CreateTicketRequest(
        @NotBlank(message = "Заголовок обязателен") String title,
        // Единый контракт создания вопроса: поле content.
        // JsonAlias сохранен для мягкой совместимости со старыми клиентами.
        @NotBlank(message = "Текст вопроса обязателен")
        @JsonAlias({"description", "body"}) String content
) {
}
