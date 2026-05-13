package com.helpdesk.review.dto;

import java.time.Instant;

public record ReviewResponse(
        Long reviewId,
        Long authorId,
        String authorUsername,
        Long targetUserId,
        Integer rating,
        String comment,
        Instant createdAt
) {
}
