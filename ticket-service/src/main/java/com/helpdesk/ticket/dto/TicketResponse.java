package com.helpdesk.ticket.dto;

import com.helpdesk.ticket.entity.TicketStatus;

import java.time.Instant;
import java.util.Set;

public record TicketResponse(
        Long id,
        String title,
        String body,
        Set<String> tags,
        TicketStatus status,
        Long authorId,
        boolean solved,
        Long acceptedCommentId,
        Instant createdAt,
        Instant updatedAt,
        long commentsCount
) {
}
