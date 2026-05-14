package com.helpdesk.ticket.dto;

public record CommentLikeResponse(
        Long commentId,
        long likesCount,
        boolean likedByCurrentUser
) {
}
