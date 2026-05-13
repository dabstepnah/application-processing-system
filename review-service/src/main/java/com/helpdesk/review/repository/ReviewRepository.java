package com.helpdesk.review.repository;
import com.helpdesk.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
public interface ReviewRepository extends JpaRepository<Review,Long>{
 List<Review> findByTargetUserId(Long targetUserId);
 @Query("select coalesce(avg(r.rating), 0) from Review r where r.targetUserId = :targetUserId")
 Double findAverageRatingByTargetUserId(Long targetUserId);
 long countByTargetUserId(Long targetUserId);
}
