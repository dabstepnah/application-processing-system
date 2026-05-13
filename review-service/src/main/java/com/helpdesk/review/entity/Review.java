package com.helpdesk.review.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="reviews") @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Review {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="author_id",nullable=false) private Long authorId;
 @Column(name="target_user_id",nullable=false) private Long targetUserId;
 @Column(nullable=false) private Integer rating;
 @Column(nullable=false,length=3000) private String comment;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt;
 @PrePersist void onCreate(){createdAt=Instant.now();}
}
