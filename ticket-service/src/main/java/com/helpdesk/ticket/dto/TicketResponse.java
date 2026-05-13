package com.helpdesk.ticket.dto;

import com.helpdesk.ticket.entity.TicketStatus;

import java.time.Instant;

public record TicketResponse(
        Long id,
        String title,
        String body,
        TicketStatus status,
        Long authorId,
        Instant createdAt,
        Instant updatedAt,
        long commentsCount
) {
}