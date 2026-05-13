import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserById } from "../api/authApi";
import { createReview, getReviewsByUser, getUserRating } from "../api/reviewApi";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { RatingStars } from "../components/RatingStars";
import { useAuth } from "../context/AuthContext";
import type { Review, User, UserRating } from "../types";

export const UserProfilePage = () => {
  const { id } = useParams();
  const { userId, isAdmin } = useAuth();
  const targetId = Number(id);
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<UserRating | null>(null);
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = async () => {
    const [u, r, rt] = await Promise.all([fetchUserById(targetId), getReviewsByUser(targetId), getUserRating(targetId)]);
    setUser(u);
    setReviews(r);
    setRating(rt);
  };

  useEffect(() => { void load(); }, [targetId]);

  if (!user) return <Card><p className="text-textSecondary">Загрузка профиля...</p></Card>;

  const canReview = !isAdmin && userId !== targetId;

  return (
    <div className="space-y-4">
      <Card title={`Профиль: ${user.username}`}>
        <div className="space-y-1 text-sm text-textSecondary">
          <p>Email: {user.email}</p>
          <p>Роль: {user.role}</p>
          <p>Заблокирован: {String(user.banned)}</p>
        </div>
      </Card>
      <Card title="Рейтинг и отзывы">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-2xl font-bold text-appAccent">{rating?.averageRating ?? 0}</p>
          <RatingStars rating={Math.round(rating?.averageRating ?? 0)} />
        </div>
        <p className="mb-3 text-sm text-textSecondary">Количество отзывов: {rating?.totalReviews ?? 0}</p>
        <div className="space-y-2">
          {reviews.map((rv) => (
            <div key={rv.reviewId} className="rounded-xl bg-appHover p-3">
              <p className="text-xs text-textSecondary">Автор: {rv.authorUsername ?? `ID ${rv.authorId}`}</p>
              <RatingStars rating={rv.rating} />
              <p>{rv.comment}</p>
            </div>
          ))}
        </div>
      </Card>
      {canReview && (
        <Card title="Оценить пользователя">
          <div className="space-y-3">
            <input type="number" min={1} max={5} value={newRating} onChange={(e) => setNewRating(Number(e.target.value))} className="rounded-xl border border-zinc-700 bg-appHover p-2" />
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-appHover p-2" />
            <Button onClick={() => createReview(targetId, newRating, comment).then(load)}>Сохранить отзыв</Button>
          </div>
        </Card>
      )}
    </div>
  );
};
