import { useEffect, useState } from "react";
import { deleteComment, getAdminQuestions, getComments } from "../api/ticketApi";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import type { Comment, Question } from "../types";

export const AdminCommentsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const load = async () => {
    const q = await getAdminQuestions();
    setQuestions(q);
    const all = await Promise.all(q.map((item) => getComments(item.id)));
    setComments(all.flat());
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <Card title="Модерация комментариев">
      <p className="mb-3 text-sm text-textSecondary">Вопросов: {questions.length}</p>
      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl bg-appHover p-3">
            <p className="text-xs text-textSecondary">Вопрос #{c.questionId}, Автор #{c.authorId}</p>
            <p className="mb-2">{c.deleted ? "Комментарий удален модератором" : c.text}</p>
            <Button variant="danger" className="text-xs" onClick={() => deleteComment(c.id).then(load)}>
              Удалить
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};
