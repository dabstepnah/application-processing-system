package com.helpdesk.ticket.dto;
public record TicketStatisticsResponse(long totalTickets,long openTickets,long inProgressTickets,long resolvedTickets,long closedTickets) {}
