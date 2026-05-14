package com.helpdesk.ticket.service;

import com.helpdesk.ticket.dto.*;
import com.helpdesk.ticket.entity.Comment;
import com.helpdesk.ticket.entity.CommentLike;
import com.helpdesk.ticket.entity.Ticket;
import com.helpdesk.ticket.entity.TicketStatus;
import com.helpdesk.ticket.exception.BadRequestException;
import com.helpdesk.ticket.exception.ForbiddenException;
import com.helpdesk.ticket.exception.NotFoundException;
import com.helpdesk.ticket.repository.CommentLikeRepository;
import com.helpdesk.ticket.repository.CommentRepository;
import com.helpdesk.ticket.repository.TicketRepository;
import com.helpdesk.ticket.security.AuthUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;

    public TicketService(TicketRepository ticketRepository,
                         CommentRepository commentRepository,
                         CommentLikeRepository commentLikeRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.commentLikeRepository = commentLikeRepository;
    }

    // Р С›Р В±РЎвЂ№РЎвЂЎР Р…РЎвЂ№Р в„– Р С—Р С•Р В»РЎРЉР В·Р С•Р Р†Р В°РЎвЂљР ВµР В»РЎРЉ РЎРѓР С•Р В·Р Т‘Р В°Р ВµРЎвЂљ Р Р…Р С•Р Р†РЎвЂ№Р в„– Р Р†Р С•Р С—РЎР‚Р С•РЎРѓ Р Р† Р В»Р ВµР Р…РЎвЂљР Вµ UniThread.
    public TicketResponse create(CreateTicketRequest request, AuthUser user) {
        if (user.isAdmin()) {
            throw new ForbiddenException("Р С’Р Т‘Р СР С‘Р Р…Р С‘РЎРѓРЎвЂљРЎР‚Р В°РЎвЂљР С•РЎР‚ Р Р…Р Вµ Р СР С•Р В¶Р ВµРЎвЂљ РЎРѓР С•Р В·Р Т‘Р В°Р Р†Р В°РЎвЂљРЎРЉ Р Р†Р С•Р С—РЎР‚Р С•РЎРѓРЎвЂ№");
        }
        if (user.banned()) {
            throw new ForbiddenException("Р вЂ”Р В°Р В±Р В»Р С•Р С”Р С‘РЎР‚Р С•Р Р†Р В°Р Р…Р Р…РЎвЂ№Р в„– Р С—Р С•Р В»РЎРЉР В·Р С•Р Р†Р В°РЎвЂљР ВµР В»РЎРЉ Р Р…Р Вµ Р СР С•Р В¶Р ВµРЎвЂљ РЎРѓР С•Р В·Р Т‘Р В°Р Р†Р В°РЎвЂљРЎРЉ Р Р†Р С•Р С—РЎР‚Р С•РЎРѓРЎвЂ№");
        }

        Ticket ticket = Ticket.builder()
                .title(request.title())
                .description(request.content())
                .status(TicketStatus.OPEN)
                .authorId(user.userId())
                .build();

        return map(ticketRepository.save(ticket));
    }

    public List<TicketResponse> getFeed(String sort) {
        List<Ticket> tickets = ticketRepository.findAll();
        return sortAndMapTickets(tickets, sort);
    }

    public List<TicketResponse> getFeedByTag(String tag, String sort) {
        // Р вЂ™РЎР‚Р ВµР СР ВµР Р…Р Р…РЎвЂ№Р в„– rollback РЎвЂљР ВµР С–Р С•Р Р†: РЎвЂћР С‘Р В»РЎРЉРЎвЂљРЎР‚Р В°РЎвЂ Р С‘РЎРЏ Р С—Р С• РЎвЂљР ВµР С–Р В°Р С Р С•РЎвЂљР С”Р В»РЎР‹РЎвЂЎР ВµР Р…Р В°.
        return getFeed(sort);
    }

    public List<TicketResponse> search(String query, String sort) {
        if (query == null || query.isBlank()) {
            return getFeed(sort);
        }
        List<Ticket> tickets = ticketRepository.searchByQuery(query.trim());
        return sortAndMapTickets(tickets, sort);
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

    // Р С’Р Р†РЎвЂљР С•РЎР‚ Р СР С•Р В¶Р ВµРЎвЂљ Р СР ВµР Р…РЎРЏРЎвЂљРЎРЉ РЎвЂљР С•Р В»РЎРЉР С”Р С• РЎРѓР Р†Р С•Р в„– Р Р†Р С•Р С—РЎР‚Р С•РЎРѓ, Р В°Р Т‘Р СР С‘Р Р… - Р В»РЎР‹Р В±Р С•Р в„–.
    public TicketResponse updateStatus(Long id, UpdateStatusRequest request, AuthUser user) {
        Ticket ticket = getTicket(id);

        if (!user.isAdmin() && !ticket.getAuthorId().equals(user.userId())) {
            throw new ForbiddenException("Р СњР ВµР Т‘Р С•РЎРѓРЎвЂљР В°РЎвЂљР С•РЎвЂЎР Р…Р С• Р С—РЎР‚Р В°Р Р† Р Т‘Р В»РЎРЏ Р С‘Р В·Р СР ВµР Р…Р ВµР Р…Р С‘РЎРЏ РЎРѓРЎвЂљР В°РЎвЂљРЎС“РЎРѓР В°");
        }

        ticket.setStatus(request.status());
        if (request.status() != TicketStatus.SOLVED) {
            // Р вЂўРЎРѓР В»Р С‘ РЎРѓРЎвЂљР В°РЎвЂљРЎС“РЎРѓ РЎС“РЎвЂ¦Р С•Р Т‘Р С‘РЎвЂљ Р С‘Р В· solved, РЎРѓР В±РЎР‚Р В°РЎРѓРЎвЂ№Р Р†Р В°Р ВµР С Р С‘ Р С—РЎР‚Р С‘Р Р†РЎРЏР В·Р С”РЎС“ Р В»РЎС“РЎвЂЎРЎв‚¬Р ВµР С–Р С• Р С•РЎвЂљР Р†Р ВµРЎвЂљР В°.
            ticket.setSolved(false);
            ticket.setAcceptedCommentId(null);
        }
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
        long resolvedQuestions = ticketRepository.countByStatus(TicketStatus.RESOLVED) + ticketRepository.countByStatus(TicketStatus.SOLVED);
        long closedQuestions = ticketRepository.countByStatus(TicketStatus.CLOSED);
        long totalComments = commentRepository.count();

        return new TicketStatisticsResponse(totalQuestions, openQuestions, discussionQuestions, resolvedQuestions, closedQuestions, totalComments);
    }

    // Р СџР С•Р В»РЎРЉР В·Р С•Р Р†Р В°РЎвЂљР ВµР В»РЎРЉРЎРѓР С”Р С‘Р Вµ Р С”Р С•Р СР СР ВµР Р…РЎвЂљР В°РЎР‚Р С‘Р С‘ РЎвЂћР С•РЎР‚Р СР С‘РЎР‚РЎС“РЎР‹РЎвЂљ Р С•Р В±РЎРѓРЎС“Р В¶Р Т‘Р ВµР Р…Р С‘Р Вµ (thread) Р С—Р С•Р Т‘ Р Р†Р С•Р С—РЎР‚Р С•РЎРѓР С•Р С.
    public CommentResponse addComment(Long questionId, CreateCommentRequest request, AuthUser user) {
        log.info("Add comment request: questionId={}, userId={}, username={}, role={}, parentCommentId={}",
                questionId, user.userId(), user.username(), user.role(), request.parentCommentId());

        if (user.isAdmin()) {
            throw new ForbiddenException("Р С’Р Т‘Р СР С‘Р Р…Р С‘РЎРѓРЎвЂљРЎР‚Р В°РЎвЂљР С•РЎР‚ Р Р…Р Вµ Р СР С•Р В¶Р ВµРЎвЂљ Р С•РЎРѓРЎвЂљР В°Р Р†Р В»РЎРЏРЎвЂљРЎРЉ Р С”Р С•Р СР СР ВµР Р…РЎвЂљР В°РЎР‚Р С‘Р С‘");
        }
        if (user.banned()) {
            throw new ForbiddenException("Р вЂ”Р В°Р В±Р В»Р С•Р С”Р С‘РЎР‚Р С•Р Р†Р В°Р Р…Р Р…РЎвЂ№Р в„– Р С—Р С•Р В»РЎРЉР В·Р С•Р Р†Р В°РЎвЂљР ВµР В»РЎРЉ Р Р…Р Вµ Р СР С•Р В¶Р ВµРЎвЂљ Р С•РЎРѓРЎвЂљР В°Р Р†Р В»РЎРЏРЎвЂљРЎРЉ Р С”Р С•Р СР СР ВµР Р…РЎвЂљР В°РЎР‚Р С‘Р С‘");
        }

        Ticket question = getTicket(questionId);

        Long parentId = request.parentCommentId();
        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new BadRequestException("Р В Р С•Р Т‘Р С‘РЎвЂљР ВµР В»РЎРЉРЎРѓР С”Р С‘Р в„– Р С”Р С•Р СР СР ВµР Р…РЎвЂљР В°РЎР‚Р С‘Р в„– Р Р…Р Вµ Р Р…Р В°Р в„–Р Т‘Р ВµР Р…"));
            if (!parent.getQuestionId().equals(questionId)) {
                throw new BadRequestException("Р В Р С•Р Т‘Р С‘РЎвЂљР ВµР В»РЎРЉРЎРѓР С”Р С‘Р в„– Р С”Р С•Р СР СР ВµР Р…РЎвЂљР В°РЎР‚Р С‘Р в„– Р С•РЎвЂљР Р…Р С•РЎРѓР С‘РЎвЂљРЎРѓРЎРЏ Р С” Р Т‘РЎР‚РЎС“Р С–Р С•Р СРЎС“ Р Р†Р С•Р С—РЎР‚Р С•РЎРѓРЎС“");
            }
            if (parent.isDeleted()) {
                throw new BadRequestException("Р СњР ВµР В»РЎРЉР В·РЎРЏ Р С•РЎвЂљР Р†Р ВµРЎвЂЎР В°РЎвЂљРЎРЉ Р Р…Р В° РЎС“Р Т‘Р В°Р В»Р ВµР Р…Р Р…РЎвЂ№Р в„– Р С”Р С•Р СР СР ВµР Р…РЎвЂљР В°РЎР‚Р С‘Р в„–");
            }
        }

        Comment comment = Comment.builder()
                .questionId(questionId)
                .authorId(user.userId())
                .authorUsername(user.username())
                .parentCommentId(parentId)
                .text(request.text())
                .build();

        if (question.getStatus() == TicketStatus.OPEN) {
            question.setStatus(TicketStatus.DISCUSSION);
            ticketRepository.save(question);
        }

        return map(commentRepository.save(comment), user, question.getAcceptedCommentId());
    }

    public List<CommentResponse> getComments(Long questionId, AuthUser user) {
        Ticket question = getTicket(questionId);
        List<Comment> comments = commentRepository.findByQuestionIdOrderByCreatedAtAsc(questionId);
        return mapComments(comments, user, question.getAcceptedCommentId());
    }

    // Р вЂєР В°Р в„–Р С” Р С”Р С•Р СР СР ВµР Р…РЎвЂљР В°РЎР‚Р С‘РЎРЏ РЎР‚Р В°Р В±Р С•РЎвЂљР В°Р ВµРЎвЂљ Р С”Р В°Р С” toggle: Р С—Р С•Р Р†РЎвЂљР С•РЎР‚Р Р…РЎвЂ№Р в„– Р С”Р В»Р С‘Р С” РЎРѓР Р…Р С‘Р СР В°Р ВµРЎвЂљ Р В»Р В°Р в„–Р С”.
    public CommentLikeResponse toggleLike(Long commentId, AuthUser user) {
        if (user.isAdmin()) {
            throw new ForbiddenException("РђРґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ РЅРµ РјРѕР¶РµС‚ СЃС‚Р°РІРёС‚СЊ Р»Р°Р№РєРё");
        }
        // Р›Р°Р№РєРё РґРѕСЃС‚СѓРїРЅС‹ С‚РѕР»СЊРєРѕ РѕР±С‹С‡РЅРѕРјСѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ.
        if (!"USER".equalsIgnoreCase(user.role())) {
            throw new ForbiddenException("РўРѕР»СЊРєРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РјРѕР¶РµС‚ СЃС‚Р°РІРёС‚СЊ Р»Р°Р№РєРё");
        }
        if (user.banned()) {
            throw new ForbiddenException("Р—Р°Р±Р»РѕРєРёСЂРѕРІР°РЅРЅС‹Р№ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ РјРѕР¶РµС‚ СЃС‚Р°РІРёС‚СЊ Р»Р°Р№РєРё");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("РљРѕРјРјРµРЅС‚Р°СЂРёР№ РЅРµ РЅР°Р№РґРµРЅ"));

        if (Objects.equals(comment.getAuthorId(), user.userId())) {
            throw new BadRequestException("РќРµР»СЊР·СЏ Р»Р°Р№РєР°С‚СЊ СЃРѕР±СЃС‚РІРµРЅРЅС‹Р№ РєРѕРјРјРµРЅС‚Р°СЂРёР№");
        }

        Optional<CommentLike> existingLike = commentLikeRepository.findByCommentIdAndUserId(commentId, user.userId());
        boolean likedByCurrentUser;
        String action;

        if (existingLike.isPresent()) {
            commentLikeRepository.delete(existingLike.get());
            likedByCurrentUser = false;
            action = "unliked";
        } else {
            commentLikeRepository.save(CommentLike.builder()
                    .commentId(commentId)
                    .userId(user.userId())
                    .build());
            likedByCurrentUser = true;
            action = "liked";
        }

        log.info("Toggle comment like: commentId={}, currentUserId={}, commentAuthorId={}, currentUserRole={}, action={}",
                commentId, user.userId(), comment.getAuthorId(), user.role(), action);

        long likesCount = commentLikeRepository.countByCommentId(commentId);
        return new CommentLikeResponse(commentId, likesCount, likedByCurrentUser);
    }

    // РђРІС‚РѕСЂ РІРѕРїСЂРѕСЃР° РјРѕР¶РµС‚ РІС‹Р±СЂР°С‚СЊ Р»СѓС‡С€РёР№ РѕС‚РІРµС‚ Рё РїРµСЂРµРІРµСЃС‚Рё РІРѕРїСЂРѕСЃ РІ СЃС‚Р°С‚СѓСЃ SOLVED.
    public TicketResponse acceptAnswer(Long questionId, Long commentId, AuthUser user) {
        Ticket question = getTicket(questionId);
        if (user.isAdmin()) {
            throw new ForbiddenException("РђРґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ РЅРµ РјРѕР¶РµС‚ РІС‹Р±РёСЂР°С‚СЊ Р»СѓС‡С€РёР№ РѕС‚РІРµС‚");
        }
        if (!"USER".equalsIgnoreCase(user.role())) {
            throw new ForbiddenException("РўРѕР»СЊРєРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РјРѕР¶РµС‚ РІС‹Р±РёСЂР°С‚СЊ Р»СѓС‡С€РёР№ РѕС‚РІРµС‚");
        }
        if (!Objects.equals(question.getAuthorId(), user.userId())) {
            throw new ForbiddenException("РўРѕР»СЊРєРѕ Р°РІС‚РѕСЂ РІРѕРїСЂРѕСЃР° РјРѕР¶РµС‚ РІС‹Р±СЂР°С‚СЊ Р»СѓС‡С€РёР№ РѕС‚РІРµС‚");
        }

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("РљРѕРјРјРµРЅС‚Р°СЂРёР№ РЅРµ РЅР°Р№РґРµРЅ"));

        if (!Objects.equals(comment.getQuestionId(), questionId)) {
            throw new BadRequestException("РљРѕРјРјРµРЅС‚Р°СЂРёР№ РѕС‚РЅРѕСЃРёС‚СЃСЏ Рє РґСЂСѓРіРѕРјСѓ РІРѕРїСЂРѕСЃСѓ");
        }
        if (comment.isDeleted()) {
            throw new BadRequestException("РќРµР»СЊР·СЏ РІС‹Р±СЂР°С‚СЊ СѓРґР°Р»РµРЅРЅС‹Р№ РєРѕРјРјРµРЅС‚Р°СЂРёР№");
        }

        question.setAcceptedCommentId(commentId);
        question.setSolved(true);
        question.setStatus(TicketStatus.SOLVED);
        return map(ticketRepository.save(question));
    }
    public TicketResponse clearAcceptedAnswer(Long questionId, AuthUser user) {
        Ticket question = getTicket(questionId);
        if (user.isAdmin()) {
            throw new ForbiddenException("РђРґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ РЅРµ РјРѕР¶РµС‚ РјРµРЅСЏС‚СЊ Р»СѓС‡С€РёР№ РѕС‚РІРµС‚");
        }
        if (!"USER".equalsIgnoreCase(user.role())) {
            throw new ForbiddenException("РўРѕР»СЊРєРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РјРѕР¶РµС‚ СЃРЅРёРјР°С‚СЊ Р»СѓС‡С€РёР№ РѕС‚РІРµС‚");
        }
        if (!Objects.equals(question.getAuthorId(), user.userId())) {
            throw new ForbiddenException("РўРѕР»СЊРєРѕ Р°РІС‚РѕСЂ РІРѕРїСЂРѕСЃР° РјРѕР¶РµС‚ СЃРЅСЏС‚СЊ Р»СѓС‡С€РёР№ РѕС‚РІРµС‚");
        }

        question.setAcceptedCommentId(null);
        question.setSolved(false);
        if (question.getStatus() == TicketStatus.SOLVED) {
            question.setStatus(TicketStatus.DISCUSSION);
        }

        return map(ticketRepository.save(question));
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
            throw new ForbiddenException("Р СњР ВµР Т‘Р С•РЎРѓРЎвЂљР В°РЎвЂљР С•РЎвЂЎР Р…Р С• Р С—РЎР‚Р В°Р Р†");
        }
    }

    private Ticket getTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Р вЂ™Р С•Р С—РЎР‚Р С•РЎРѓ Р Р…Р Вµ Р Р…Р В°Р в„–Р Т‘Р ВµР Р…"));
    }

    private List<TicketResponse> sortAndMapTickets(List<Ticket> tickets, String sort) {
        if ("popular".equalsIgnoreCase(sort)) {
            return tickets.stream()
                    .sorted(Comparator.comparingLong((Ticket t) -> commentRepository.countByQuestionId(t.getId())).reversed())
                    .map(this::map)
                    .toList();
        }

        return tickets.stream()
                .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
                .map(this::map)
                .toList();
    }

    private TicketResponse map(Ticket t) {
        long commentsCount = commentRepository.countByQuestionId(t.getId());
        return new TicketResponse(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getTags(),
                t.getStatus(),
                t.getAuthorId(),
                t.isSolved(),
                t.getAcceptedCommentId(),
                t.getCreatedAt(),
                t.getUpdatedAt(),
                commentsCount
        );
    }

    private List<CommentResponse> mapComments(List<Comment> comments, AuthUser user, Long acceptedCommentId) {
        Map<Long, Long> likesByComment = new HashMap<>();
        Set<Long> likedByCurrentUser = new HashSet<>();

        if (!comments.isEmpty()) {
            List<Long> commentIds = comments.stream().map(Comment::getId).toList();

            // Р РЋРЎвЂЎР С‘РЎвЂљР В°Р ВµР С Р В»Р В°Р в„–Р С”Р С‘ Р В±Р В°РЎвЂљРЎвЂЎР ВµР С, РЎвЂЎРЎвЂљР С•Р В±РЎвЂ№ Р Р…Р Вµ Р Т‘Р ВµР В»Р В°РЎвЂљРЎРЉ N+1 Р В·Р В°Р С—РЎР‚Р С•РЎРѓР С•Р Р†.
            for (Object[] row : commentLikeRepository.countByCommentIds(commentIds)) {
                likesByComment.put((Long) row[0], (Long) row[1]);
            }

            if (user != null) {
                likedByCurrentUser.addAll(commentLikeRepository.findLikedCommentIdsByUserId(user.userId(), commentIds));
            }
        }

        return comments.stream()
                .map(comment -> {
                    long likes = likesByComment.getOrDefault(comment.getId(), 0L);
                    boolean liked = likedByCurrentUser.contains(comment.getId());
                    return map(comment, likes, liked, acceptedCommentId);
                })
                .toList();
    }

    private CommentResponse map(Comment c, AuthUser currentUser, Long acceptedCommentId) {
        long likesCount = commentLikeRepository.countByCommentId(c.getId());
        boolean likedByCurrentUser = currentUser != null
                && commentLikeRepository.findByCommentIdAndUserId(c.getId(), currentUser.userId()).isPresent();
        return map(c, likesCount, likedByCurrentUser, acceptedCommentId);
    }

    private CommentResponse map(Comment c, long likesCount, boolean likedByCurrentUser, Long acceptedCommentId) {
        String authorUsername = c.getAuthorUsername();
        if (authorUsername == null || authorUsername.isBlank()) {
            authorUsername = "Р СџР С•Р В»РЎРЉР В·Р С•Р Р†Р В°РЎвЂљР ВµР В»РЎРЉ #" + c.getAuthorId();
        }

        return new CommentResponse(
                c.getId(),
                c.getQuestionId(),
                c.getAuthorId(),
                authorUsername,
                c.getText(),
                c.getParentCommentId(),
                c.isDeleted(),
                likesCount,
                likedByCurrentUser,
                Objects.equals(c.getId(), acceptedCommentId),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}

