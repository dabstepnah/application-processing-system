import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuestions } from "../api/ticketApi";
import { Card } from "../components/Card";
import { Loader } from "../components/Loader";
import type { Question } from "../types";

const statusMap: Record<string, string> = {
  OPEN: "Открыт",
  DISCUSSION: "Обсуждение",
  RESOLVED: "Решен",
  CLOSED: "Закрыт"
};

export const FeedPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getQuestions().then((data) => {
      setQuestions(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <Card title="Свежие вопросы">
        <p className="text-textSecondary">Лента вопросов студентов и обсуждений.</p>
      </Card>
      {questions.length === 0 && <Card><p className="text-textSecondary">Пока нет вопросов.</p></Card>}
      {questions.map((q) => (
        <Card key={q.id} title={q.title}>
          <p className="mb-2 text-textSecondary line-clamp-3">{q.body}</p>
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-textSecondary">
            <span>Автор ID: {q.authorId}</span>
            <span>Статус: {statusMap[q.status]}</span>
            <span>Комментариев: {q.commentsCount}</span>
          </div>
          <Link to={`/questions/${q.id}`} className="rounded-xl bg-appAccent px-3 py-2 text-sm font-medium text-black transition hover:brightness-110">
            Открыть обсуждение
          </Link>
        </Card>
      ))}
    </div>
  );
};
