package com.helpdesk.ticket.dto;

public record TicketStatisticsResponse(
        long totalQuestions,
        long openQuestions,
        long discussionQuestions,
        long resolvedQuestions,
        long closedQuestions,
        long totalComments
) {
}