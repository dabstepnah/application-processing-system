package com.helpdesk.review.service;

import com.helpdesk.review.dto.*;
import com.helpdesk.review.entity.Review;
import com.helpdesk.review.exception.BadRequestException;
import com.helpdesk.review.exception.ForbiddenException;
import com.helpdesk.review.exception.NotFoundException;
import com.helpdesk.review.repository.ReviewRepository;
import com.helpdesk.review.security.AuthUser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    // Рейтинг и отзыв доступны только обычному пользователю.
    public ReviewResponse create(CreateReviewRequest request, AuthUser author) {
        if (author.isAdmin()) {
            throw new ForbiddenException("Администратор не может оставлять отзывы и оценки");
        }
        if (author.banned()) {
            throw new ForbiddenException("Заблокированный пользователь не может оставлять отзывы");
        }
        if (author.userId().equals(request.targetUserId())) {
            throw new BadRequestException("Нельзя оставить отзыв самому себе");
        }

        Review review = Review.builder()
                .authorId(author.userId())
                .targetUserId(request.targetUserId())
                .rating(request.rating())
                .comment(request.comment())
                .build();

        return map(reviewRepository.save(review));
    }

    public List<ReviewResponse> getByUserId(Long userId) {
        return reviewRepository.findByTargetUserId(userId).stream().map(this::map).toList();
    }

    public UserRatingResponse getRating(Long userId) {
        double avg = reviewRepository.findAverageRatingByTargetUserId(userId);
        long count = reviewRepository.countByTargetUserId(userId);
        return new UserRatingResponse(userId, Math.round(avg * 100.0) / 100.0, count);
    }

    public void delete(Long id, AuthUser user) {
        if (!user.isAdmin()) {
            throw new ForbiddenException("Удаление отзывов доступно только администратору");
        }
        Review review = reviewRepository.findById(id).orElseThrow(() -> new NotFoundException("Отзыв не найден"));
        reviewRepository.delete(review);
    }

    private ReviewResponse map(Review review) {
        return new ReviewResponse(review.getId(), review.getAuthorId(), null, review.getTargetUserId(), review.getRating(), review.getComment(), review.getCreatedAt());
    }
}
