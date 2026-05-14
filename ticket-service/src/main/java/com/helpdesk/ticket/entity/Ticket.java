package com.helpdesk.ticket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "questions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "body", nullable = false, length = 3000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @Column(name = "author_id", nullable = false)
    private Long authorId;

    // Набор тегов вопроса. Храним в отдельной таблице без лишней сложности many-to-many.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_tags", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "tag", nullable = false, length = 64)
    @Builder.Default
    private Set<String> tags = new LinkedHashSet<>();

    // Флаг и ссылка на лучший ответ для быстрого отображения статуса "Решено".
    @Column(nullable = false)
    private boolean solved;

    @Column(name = "accepted_comment_id")
    private Long acceptedCommentId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
        solved = false;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
