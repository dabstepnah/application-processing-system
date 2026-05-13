import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addComment, getComments, getQuestionById } from "../api/ticketApi";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";
import type { Comment, Question } from "../types";

export const QuestionPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const qid = Number(id);
    const [q, c] = await Promise.all([getQuestionById(qid), getComments(qid)]);
    setQuestion(q);
    setComments(c);
  };

  useEffect(() => { void load(); }, [id]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addComment(Number(id), text);
      setText("");
      setMessage("Комментарий добавлен");
      await load();
    } catch {
      setMessage("Недостаточно прав или не удалось добавить комментарий");
    }
  };

  if (!question) return <Card><p className="text-textSecondary">Загрузка вопроса...</p></Card>;

  return (
    <div className="space-y-4">
      <Card title={question.title}>
        <p className="mb-3 text-textSecondary">{question.body}</p>
        <div className="flex items-center gap-3 text-xs text-textSecondary">
          <span>Автор: {question.authorId}</span>
          <span>Статус: {question.status}</span>
          <Link to={`/users/${question.authorId}`} className="text-appAccent">Профиль автора</Link>
        </div>
      </Card>

      <Card title="Обсуждение">
        {comments.length === 0 && <p className="mb-3 text-textSecondary">Комментариев пока нет.</p>}
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-appHover p-3 text-sm">
              <p className="text-xs text-textSecondary">Пользователь #{c.authorId}</p>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </Card>

      {!isAdmin && (
        <Card title="Добавить комментарий">
          <form onSubmit={submit} className="space-y-3">
            <textarea className="w-full rounded-xl border border-zinc-700 bg-appHover p-3 text-white" value={text} onChange={(e) => setText(e.target.value)} required />
            {message && <p className="text-sm text-appAccent">{message}</p>}
            <button className="rounded-xl bg-appAccent px-4 py-2 text-black">Отправить</button>
          </form>
        </Card>
      )}
    </div>
  );
};
