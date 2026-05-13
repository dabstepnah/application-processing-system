package com.helpdesk.review.controller;

import com.helpdesk.review.dto.CreateReviewRequest;
import com.helpdesk.review.dto.ReviewResponse;
import com.helpdesk.review.dto.UserRatingResponse;
import com.helpdesk.review.security.AuthUser;
import com.helpdesk.review.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/api/reviews")
    public ReviewResponse create(@Valid @RequestBody CreateReviewRequest request,
                                 @AuthenticationPrincipal AuthUser user) {
        return reviewService.create(request, user);
    }

    @GetMapping("/api/reviews/user/{userId}")
    public List<ReviewResponse> getByUser(@PathVariable Long userId) {
        return reviewService.getByUserId(userId);
    }

    @GetMapping("/api/reviews/user/{userId}/rating")
    public UserRatingResponse getRating(@PathVariable Long userId) {
        return reviewService.getRating(userId);
    }

    @DeleteMapping("/api/admin/reviews/{id}")
    public Map<String, String> delete(@PathVariable Long id, @AuthenticationPrincipal AuthUser user) {
        reviewService.delete(id, user);
        return Map.of("message", "Отзыв удален");
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "review-service");
    }
}
