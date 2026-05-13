package com.helpdesk.ticket.dto;

import java.time.Instant;

public record CommentResponse(
        Long id,
        Long questionId,
        Long authorId,
        String text,
        boolean deleted,
        Instant createdAt,
        Instant updatedAt
) {
}