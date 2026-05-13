package com.helpdesk.ticket.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="tickets") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Ticket {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String title;
 @Column(nullable=false,length=3000) private String description;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private TicketStatus status;
 @Column(name="author_id",nullable=false) private Long authorId;
 @Column(name="assigned_to_id") private Long assignedToId;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt;
 @Column(name="updated_at",nullable=false) private Instant updatedAt;
 @PrePersist void onCreate(){createdAt=Instant.now();updatedAt=createdAt;}
 @PreUpdate void onUpdate(){updatedAt=Instant.now();}
}
