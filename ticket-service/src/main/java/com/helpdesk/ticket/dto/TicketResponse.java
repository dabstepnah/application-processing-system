package com.helpdesk.ticket.dto;
import com.helpdesk.ticket.entity.TicketStatus;
import java.time.Instant;
public record TicketResponse(Long id,String title,String description,TicketStatus status,Long authorId,Long assignedToId,Instant createdAt,Instant updatedAt) {}
