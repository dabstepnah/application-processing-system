package com.helpdesk.ticket.service;

import com.helpdesk.ticket.dto.*;
import com.helpdesk.ticket.entity.Ticket;
import com.helpdesk.ticket.entity.TicketStatus;
import com.helpdesk.ticket.exception.ForbiddenException;
import com.helpdesk.ticket.exception.NotFoundException;
import com.helpdesk.ticket.repository.TicketRepository;
import com.helpdesk.ticket.security.AuthUser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    // Создание заявки текущим пользователем.
    public TicketResponse create(CreateTicketRequest request, AuthUser user) {
        Ticket ticket = Ticket.builder()
                .title(request.title())
                .description(request.description())
                .status(TicketStatus.OPEN)
                .authorId(user.userId())
                .build();

        return map(ticketRepository.save(ticket));
    }

    public TicketResponse getById(Long id, AuthUser user) {
        Ticket ticket = getTicket(id);
        if (!user.isAdmin() && !ticket.getAuthorId().equals(user.userId())) {
            throw new ForbiddenException("Недостаточно прав для просмотра заявки");
        }
        return map(ticket);
    }

    public List<TicketResponse> getByUser(Long userId, AuthUser currentUser) {
        if (!currentUser.isAdmin() && !currentUser.userId().equals(userId)) {
            throw new ForbiddenException("Недостаточно прав для просмотра заявок пользователя");
        }
        return ticketRepository.findByAuthorId(userId).stream().map(this::map).toList();
    }

    public List<TicketResponse> getAll(AuthUser user) {
        if (!user.isAdmin()) {
            throw new ForbiddenException("Только администратор может просматривать все заявки");
        }
        return ticketRepository.findAll().stream().map(this::map).toList();
    }

    // Администратор меняет любой статус, пользователь может только закрыть свою заявку.
    public TicketResponse updateStatus(Long id, UpdateStatusRequest request, AuthUser user) {
        Ticket ticket = getTicket(id);

        if (user.isAdmin()) {
            ticket.setStatus(request.status());
        } else {
            if (!ticket.getAuthorId().equals(user.userId())) {
                throw new ForbiddenException("Можно менять только свою заявку");
            }
            if (request.status() != TicketStatus.CLOSED) {
                throw new ForbiddenException("Пользователь может только закрыть заявку");
            }
            ticket.setStatus(TicketStatus.CLOSED);
        }

        return map(ticketRepository.save(ticket));
    }

    public TicketStatisticsResponse statistics(AuthUser user) {
        if (!user.isAdmin()) {
            throw new ForbiddenException("Только администратор может смотреть статистику");
        }

        return new TicketStatisticsResponse(
                ticketRepository.count(),
                ticketRepository.countByStatus(TicketStatus.OPEN),
                ticketRepository.countByStatus(TicketStatus.IN_PROGRESS),
                ticketRepository.countByStatus(TicketStatus.RESOLVED),
                ticketRepository.countByStatus(TicketStatus.CLOSED)
        );
    }

    private Ticket getTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Заявка не найдена"));
    }

    private TicketResponse map(Ticket t) {
        return new TicketResponse(t.getId(), t.getTitle(), t.getDescription(), t.getStatus(), t.getAuthorId(), t.getAssignedToId(), t.getCreatedAt(), t.getUpdatedAt());
    }
}
