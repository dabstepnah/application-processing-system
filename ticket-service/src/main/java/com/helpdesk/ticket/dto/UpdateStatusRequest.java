package com.helpdesk.ticket.dto;
import com.helpdesk.ticket.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;
public record UpdateStatusRequest(@NotNull(message="status обязателен") TicketStatus status) {}
