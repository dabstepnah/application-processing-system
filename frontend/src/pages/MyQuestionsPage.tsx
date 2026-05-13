import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getQuestionsByUser } from "../api/ticketApi";
import { Card } from "../components/Card";
import { Link } from "react-router-dom";
import type { Question } from "../types";

export const MyQuestionsPage = () => {
  const { userId } = useAuth();
  const [items, setItems] = useState<Question[]>([]);

  useEffect(() => {
    if (!userId) return;
    void getQuestionsByUser(userId).then(setItems);
  }, [userId]);

  return (
    <div className="space-y-4">
      <Card title="Мои вопросы"><p className="text-textSecondary">Список вопросов текущего пользователя.</p></Card>
      {items.map((q) => (
        <Card key={q.id} title={q.title}>
          <p className="text-textSecondary">{q.body}</p>
          <Link to={`/questions/${q.id}`} className="mt-3 inline-block text-appAccent">Открыть обсуждение</Link>
        </Card>
      ))}
    </div>
  );
};
