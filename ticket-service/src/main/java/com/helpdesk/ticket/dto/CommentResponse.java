package com.helpdesk.ticket.dto;

import java.time.Instant;

public record CommentResponse(
        Long id,
        Long questionId,
        Long authorId,
        String authorUsername,
        String text,
        Long parentCommentId,
        boolean deleted,
        Instant createdAt,
        Instant updatedAt
) {
}
