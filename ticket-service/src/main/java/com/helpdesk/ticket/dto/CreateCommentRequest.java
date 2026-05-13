package com.helpdesk.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(
        @NotBlank(message = "Текст комментария обязателен") String text,
        Long parentCommentId
) {
}
