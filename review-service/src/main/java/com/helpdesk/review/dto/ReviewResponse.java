package com.helpdesk.review.dto;
import java.time.Instant;
public record ReviewResponse(Long id,Long authorId,Long targetUserId,Integer rating,String comment,Instant createdAt) {}
