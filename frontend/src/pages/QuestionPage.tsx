import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
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
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [commentsError, setCommentsError] = useState("");

  const load = async () => {
    const qid = Number(id);
    if (!qid || Number.isNaN(qid)) {
      setQuestion(null);
      setQuestionError("Некорректный идентификатор вопроса");
      setComments([]);
      setCommentsError("");
      return;
    }

    setLoading(true);
    setQuestionError("");
    setCommentsError("");

    try {
      // Сначала загружаем вопрос, чтобы падение комментариев не блокировало страницу.
      const q = await getQuestionById(qid);
      setQuestion(q);
    } catch (error) {
      setQuestion(null);
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 404) setQuestionError("Вопрос не найден");
        else if (status === 403) setQuestionError("Недостаточно прав для просмотра вопроса");
        else if (status >= 500) setQuestionError("Ошибка сервера при загрузке вопроса");
        else setQuestionError("Не удалось загрузить вопрос");
      } else {
        setQuestionError("Не удалось загрузить вопрос");
      }
      setComments([]);
      return;
    } finally {
      // Обязательно сбрасываем loading, чтобы не зависать на вечной загрузке.
      setLoading(false);
    }

    try {
      const c = await getComments(qid);
      setComments(c);
    } catch {
      setComments([]);
      setCommentsError("Не удалось загрузить комментарии");
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addComment(Number(id), text, replyTo?.id ?? null);
      setText("");
      setReplyTo(null);
      setMessage("Комментарий добавлен");
      await load();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const payload = error.response.data as { message?: string } | undefined;
        if (status === 401) setMessage("Необходимо войти в систему");
        else if (status === 403) setMessage("У администратора нет права писать комментарии или пользователь заблокирован");
        else if (status === 400) setMessage(payload?.message ?? "Проверьте данные комментария");
        else if (status >= 500) setMessage("Ошибка сервера при добавлении комментария");
        else setMessage("Не удалось добавить комментарий");
      } else {
        setMessage("Не удалось добавить комментарий");
      }
    }
  };

  const commentsById = useMemo(() => {
    const map = new Map<number, Comment>();
    comments.forEach((c) => map.set(c.id, c));
    return map;
  }, [comments]);

  // Формируем дерево на 1 уровень: корневой комментарий + ответы сразу под ним.
  const threadedComments = useMemo(() => {
    const roots = comments.filter((c) => c.parentCommentId === null);
    const childrenMap = new Map<number, Comment[]>();

    comments
      .filter((c) => c.parentCommentId !== null)
      .forEach((child) => {
        const parentId = child.parentCommentId as number;
        const arr = childrenMap.get(parentId) ?? [];
        arr.push(child);
        childrenMap.set(parentId, arr);
      });

    roots.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    childrenMap.forEach((arr) => arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));

    const result: Array<{ comment: Comment; level: 0 | 1 }> = [];
    roots.forEach((root) => {
      result.push({ comment: root, level: 0 });
      (childrenMap.get(root.id) ?? []).forEach((reply) => result.push({ comment: reply, level: 1 }));
    });

    return result;
  }, [comments]);

  if (loading) return <Card><p className="text-textSecondary">Загрузка вопроса...</p></Card>;
  if (questionError) return <Card><p className="text-red-400">{questionError}</p></Card>;
  if (!question) return <Card><p className="text-red-400">Вопрос не найден</p></Card>;

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
        {commentsError && <p className="mb-3 text-sm text-red-400">{commentsError}</p>}
        {threadedComments.length === 0 && <p className="mb-3 text-textSecondary">Комментариев пока нет.</p>}
        <div className="space-y-2">
          {threadedComments.map(({ comment, level }) => {
            const parent = comment.parentCommentId ? commentsById.get(comment.parentCommentId) : null;
            return (
              <div
                key={comment.id}
                className={`rounded-xl bg-appHover p-3 text-sm ${level === 1 ? "ml-6 border-l border-zinc-600" : ""}`}
              >
                <p className="text-xs text-textSecondary">{comment.authorUsername}</p>
                {level === 1 && parent && (
                  <p className="mb-1 text-xs text-textSecondary">В ответ пользователю {parent.authorUsername}</p>
                )}
                <p>{comment.deleted ? "Комментарий удален модератором" : comment.text}</p>
                {!isAdmin && !comment.deleted && level === 0 && (
                  <button
                    onClick={() => setReplyTo(comment)}
                    className="mt-2 text-xs text-appAccent hover:underline"
                  >
                    Ответить
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {!isAdmin && (
        <Card title="Добавить комментарий">
          <form onSubmit={submit} className="space-y-3">
            {replyTo && (
              <div className="rounded-xl bg-zinc-900 p-2 text-xs text-textSecondary">
                <p>Ответ пользователю {replyTo.authorUsername}</p>
                <button type="button" onClick={() => setReplyTo(null)} className="mt-1 text-appAccent hover:underline">
                  Отменить ответ
                </button>
              </div>
            )}
            <textarea
              className="w-full rounded-xl border border-zinc-700 bg-appHover p-3 text-white"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            {message && <p className="text-sm text-appAccent">{message}</p>}
            <button className="rounded-xl bg-appAccent px-4 py-2 text-black">Отправить</button>
          </form>
        </Card>
      )}
    </div>
  );
};
