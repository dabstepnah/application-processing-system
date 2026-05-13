package com.helpdesk.ticket.controller;

import com.helpdesk.ticket.dto.*;
import com.helpdesk.ticket.security.AuthUser;
import com.helpdesk.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/api/tickets")
    public TicketResponse create(@Valid @RequestBody CreateTicketRequest request, @AuthenticationPrincipal AuthUser user) {
        return ticketService.create(request, user);
    }

    @GetMapping("/api/tickets/{id}")
    public TicketResponse getById(@PathVariable Long id, @AuthenticationPrincipal AuthUser user) {
        return ticketService.getById(id, user);
    }

    @GetMapping("/api/tickets/user/{userId}")
    public List<TicketResponse> getByUser(@PathVariable Long userId, @AuthenticationPrincipal AuthUser user) {
        return ticketService.getByUser(userId, user);
    }

    @GetMapping("/api/admin/tickets")
    public List<TicketResponse> getAll(@AuthenticationPrincipal AuthUser user) {
        return ticketService.getAll(user);
    }

    @PatchMapping("/api/tickets/{id}/status")
    public TicketResponse updateStatus(@PathVariable Long id,
                                       @Valid @RequestBody UpdateStatusRequest request,
                                       @AuthenticationPrincipal AuthUser user) {
        return ticketService.updateStatus(id, request, user);
    }

    @GetMapping("/api/admin/tickets/statistics")
    public TicketStatisticsResponse statistics(@AuthenticationPrincipal AuthUser user) {
        return ticketService.statistics(user);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "ticket-service");
    }
}
