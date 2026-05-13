import { useEffect, useState } from "react";
import { deleteReview, getReviewsByUser } from "../api/reviewApi";
import { fetchUsers } from "../api/authApi";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import type { Review, User } from "../types";

export const AdminReviewsPage = () => {
  const [items, setItems] = useState<Review[]>([]);

  const load = async () => {
    const users: User[] = await fetchUsers();
    const reviewsByUser = await Promise.all(users.map((u) => getReviewsByUser(u.id)));
    setItems(reviewsByUser.flat());
  };

  useEffect(() => { void load(); }, []);

  return (
    <Card title="Модерация отзывов">
      <div className="space-y-2">
        {items.map((r) => (
          <div key={r.reviewId} className="rounded-xl bg-appHover p-3">
            <p className="text-xs text-textSecondary">Пользователь #{r.targetUserId}, Автор #{r.authorId}</p>
            <p className="mb-2">{r.comment}</p>
            <Button variant="danger" className="text-xs" onClick={() => deleteReview(r.reviewId).then(load)}>Удалить</Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
