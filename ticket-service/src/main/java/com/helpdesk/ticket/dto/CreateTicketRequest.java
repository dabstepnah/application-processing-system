package com.helpdesk.ticket.dto;
import jakarta.validation.constraints.NotBlank;
public record CreateTicketRequest(@NotBlank(message="title обязателен") String title,@NotBlank(message="description обязателен") String description) {}
