package com.helpdesk.review.dto;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public record CreateReviewRequest(
        @NotNull(message="targetUserId обязателен") Long targetUserId,
        @NotNull(message="rating обязателен") @Min(value=1,message="rating должен быть от 1 до 5") @Max(value=5,message="rating должен быть от 1 до 5") Integer rating,
        @NotBlank(message="comment обязателен") String comment
) {}
