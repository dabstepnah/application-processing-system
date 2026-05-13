package com.helpdesk.ticket.service;

import com.helpdesk.ticket.dto.*;
import com.helpdesk.ticket.entity.Comment;
import com.helpdesk.ticket.entity.Ticket;
import com.helpdesk.ticket.entity.TicketStatus;
import com.helpdesk.ticket.exception.BadRequestException;
import com.helpdesk.ticket.exception.ForbiddenException;
import com.helpdesk.ticket.exception.NotFoundException;
import com.helpdesk.ticket.repository.CommentRepository;
import com.helpdesk.ticket.repository.TicketRepository;
import com.helpdesk.ticket.security.AuthUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;

    public TicketService(TicketRepository ticketRepository, CommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
    }

    // Обычный пользователь создает новый вопрос в ленте.
    public TicketResponse create(CreateTicketRequest request, AuthUser user) {
        if (user.isAdmin()) {
            throw new ForbiddenException("Администратор не может создавать вопросы");
        }
        if (user.banned()) {
            throw new ForbiddenException("Заблокированный пользователь не может создавать вопросы");
        }

        Ticket ticket = Ticket.builder()
                .title(request.title())
                .description(request.description())
                .status(TicketStatus.OPEN)
                .authorId(user.userId())
                .build();

        return map(ticketRepository.save(ticket));
    }

    public List<TicketResponse> getFeed() {
        return ticketRepository.findAll().stream().map(this::map).toList();
    }

    public TicketResponse getById(Long id) {
        return map(getTicket(id));
    }

    public List<TicketResponse> getByUser(Long userId) {
        return ticketRepository.findByAuthorId(userId).stream().map(this::map).toList();
    }

    public List<TicketResponse> getAllForAdmin(AuthUser user) {
        requireAdmin(user);
        return ticketRepository.findAll().stream().map(this::map).toList();
    }

    // Автор может менять только свой вопрос, админ - любой.
    public TicketResponse updateStatus(Long id, UpdateStatusRequest request, AuthUser user) {
        Ticket ticket = getTicket(id);

        if (!user.isAdmin() && !ticket.getAuthorId().equals(user.userId())) {
            throw new ForbiddenException("Недостаточно прав для изменения статуса");
        }

        ticket.setStatus(request.status());
        return map(ticketRepository.save(ticket));
    }

    public void deleteQuestion(Long id, AuthUser user) {
        requireAdmin(user);
        Ticket ticket = getTicket(id);
        ticketRepository.delete(ticket);
    }

    public TicketStatisticsResponse statistics(AuthUser user) {
        requireAdmin(user);
        long totalQuestions = ticketRepository.count();
        long openQuestions = ticketRepository.countByStatus(TicketStatus.OPEN);
        long discussionQuestions = ticketRepository.countByStatus(TicketStatus.DISCUSSION);
        long resolvedQuestions = ticketRepository.countByStatus(TicketStatus.RESOLVED);
        long closedQuestions = ticketRepository.countByStatus(TicketStatus.CLOSED);
        long totalComments = commentRepository.count();

        return new TicketStatisticsResponse(totalQuestions, openQuestions, discussionQuestions, resolvedQuestions, closedQuestions, totalComments);
    }

    // Пользовательские комментарии формируют обсуждение (thread) под вопросом.
    public CommentResponse addComment(Long questionId, CreateCommentRequest request, AuthUser user) {
        // Временная диагностическая запись для проверки контекста пользователя при создании комментария.
        log.info("Add comment request: questionId={}, userId={}, username={}, role={}, parentCommentId={}",
                questionId, user.userId(), user.username(), user.role(), request.parentCommentId());

        if (user.isAdmin()) {
            throw new ForbiddenException("Администратор не может оставлять комментарии");
        }
        if (user.banned()) {
            throw new ForbiddenException("Заблокированный пользователь не может оставлять комментарии");
        }

        getTicket(questionId);

        Long parentId = request.parentCommentId();
        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new BadRequestException("Родительский комментарий не найден"));
            if (!parent.getQuestionId().equals(questionId)) {
                throw new BadRequestException("Родительский комментарий относится к другому вопросу");
            }
            if (parent.isDeleted()) {
                throw new BadRequestException("Нельзя отвечать на удаленный комментарий");
            }
        }

        Comment comment = Comment.builder()
                .questionId(questionId)
                .authorId(user.userId())
                .authorUsername(user.username())
                .parentCommentId(parentId)
                .text(request.text())
                .build();

        Ticket question = getTicket(questionId);
        if (question.getStatus() == TicketStatus.OPEN) {
            question.setStatus(TicketStatus.DISCUSSION);
            ticketRepository.save(question);
        }

        return map(commentRepository.save(comment));
    }

    public List<CommentResponse> getComments(Long questionId) {
        getTicket(questionId);
        return commentRepository.findByQuestionIdOrderByCreatedAtAsc(questionId).stream().map(this::map).toList();
    }

    public void deleteComment(Long commentId, AuthUser user) {
        requireAdmin(user);
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("Комментарий не найден"));
        comment.setDeleted(true);
        comment.setText("Комментарий удален модератором");
        commentRepository.save(comment);
    }

    private void requireAdmin(AuthUser user) {
        if (!user.isAdmin()) {
            throw new ForbiddenException("Недостаточно прав");
        }
    }

    private Ticket getTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Вопрос не найден"));
    }

    private TicketResponse map(Ticket t) {
        long commentsCount = commentRepository.countByQuestionId(t.getId());
        return new TicketResponse(t.getId(), t.getTitle(), t.getDescription(), t.getStatus(), t.getAuthorId(), t.getCreatedAt(), t.getUpdatedAt(), commentsCount);
    }

    private CommentResponse map(Comment c) {
        String authorUsername = c.getAuthorUsername();
        if (authorUsername == null || authorUsername.isBlank()) {
            // Обратная совместимость со старыми строками, где username мог отсутствовать.
            authorUsername = "Пользователь #" + c.getAuthorId();
        }

        return new CommentResponse(
                c.getId(),
                c.getQuestionId(),
                c.getAuthorId(),
                authorUsername,
                c.getText(),
                c.getParentCommentId(),
                c.isDeleted(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
