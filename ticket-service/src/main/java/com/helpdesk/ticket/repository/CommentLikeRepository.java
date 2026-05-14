package com.helpdesk.ticket.repository;

import com.helpdesk.ticket.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    Optional<CommentLike> findByCommentIdAndUserId(Long commentId, Long userId);

    long countByCommentId(Long commentId);

    @Query("select cl.commentId, count(cl) from CommentLike cl where cl.commentId in :commentIds group by cl.commentId")
    List<Object[]> countByCommentIds(Collection<Long> commentIds);

    @Query("select cl.commentId from CommentLike cl where cl.userId = :userId and cl.commentId in :commentIds")
    List<Long> findLikedCommentIdsByUserId(Long userId, Collection<Long> commentIds);
}
