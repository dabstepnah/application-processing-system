package com.helpdesk.ticket.controller;

import com.helpdesk.ticket.dto.*;
import com.helpdesk.ticket.security.AuthUser;
import com.helpdesk.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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

    // Новый публичный API UniThread для работы с вопросами.
    @PostMapping({"/api/questions", "/api/tickets"})
    public TicketResponse create(@Valid @RequestBody CreateTicketRequest request, @AuthenticationPrincipal AuthUser user) {
        return ticketService.create(request, user);
    }

    @GetMapping({"/api/questions", "/api/tickets"})
    public List<TicketResponse> getFeed() {
        return ticketService.getFeed();
    }

    @GetMapping({"/api/questions/{id}", "/api/tickets/{id}"})
    public TicketResponse getById(@PathVariable Long id) {
        return ticketService.getById(id);
    }

    @GetMapping({"/api/questions/user/{userId}", "/api/tickets/user/{userId}"})
    public List<TicketResponse> getByUser(@PathVariable Long userId) {
        return ticketService.getByUser(userId);
    }

    @PatchMapping({"/api/questions/{id}/status", "/api/tickets/{id}/status"})
    public TicketResponse updateStatus(@PathVariable Long id,
                                       @Valid @RequestBody UpdateStatusRequest request,
                                       @AuthenticationPrincipal AuthUser user) {
        return ticketService.updateStatus(id, request, user);
    }

    @GetMapping({"/api/admin/questions", "/api/admin/tickets"})
    public List<TicketResponse> getAll(@AuthenticationPrincipal AuthUser user) {
        return ticketService.getAllForAdmin(user);
    }

    @DeleteMapping({"/api/admin/questions/{id}", "/api/admin/tickets/{id}"})
    public ResponseEntity<Map<String, String>> deleteQuestion(@PathVariable Long id, @AuthenticationPrincipal AuthUser user) {
        ticketService.deleteQuestion(id, user);
        return ResponseEntity.ok(Map.of("message", "Вопрос удален"));
    }

    @GetMapping({"/api/admin/questions/statistics", "/api/admin/tickets/statistics"})
    public TicketStatisticsResponse statistics(@AuthenticationPrincipal AuthUser user) {
        return ticketService.statistics(user);
    }

    @PostMapping("/api/questions/{questionId}/comments")
    public CommentResponse addComment(@PathVariable Long questionId,
                                      @Valid @RequestBody CreateCommentRequest request,
                                      @AuthenticationPrincipal AuthUser user) {
        return ticketService.addComment(questionId, request, user);
    }

    @GetMapping("/api/questions/{questionId}/comments")
    public List<CommentResponse> getComments(@PathVariable Long questionId) {
        return ticketService.getComments(questionId);
    }

    @DeleteMapping("/api/admin/comments/{commentId}")
    public ResponseEntity<Map<String, String>> deleteComment(@PathVariable Long commentId,
                                                             @AuthenticationPrincipal AuthUser user) {
        ticketService.deleteComment(commentId, user);
        return ResponseEntity.ok(Map.of("message", "Комментарий удален"));
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "ticket-service");
    }
}