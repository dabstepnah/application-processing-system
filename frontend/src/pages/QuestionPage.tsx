import { FormEvent, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  acceptAnswer,
  addComment,
  clearAcceptedAnswer,
  getComments,
  getQuestionById,
  toggleCommentLike
} from "../api/ticketApi";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";
import type { Comment, Question } from "../types";

export const QuestionPage = () => {
  const { id } = useParams();
  const { isAdmin, userId, role } = useAuth();
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

    // Перед загрузкой сбрасываем состояния, чтобы UI корректно отрабатывал повторные переходы.
    setLoading(true);
    setQuestionError("");
    setCommentsError("");

    try {
      const q = await getQuestionById(qid);
      setQuestion(q);

      // Ошибка комментариев не должна блокировать показ карточки вопроса.
      try {
        const c = await getComments(qid);
        setComments(c);
      } catch {
        setComments([]);
        setCommentsError("Не удалось загрузить комментарии");
      }
    } catch (error) {
      setQuestion(null);
      setComments([]);

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status === 404) setQuestionError("Вопрос не найден");
        else if (status === 403) setQuestionError("Недостаточно прав для просмотра вопроса");
        else if (status >= 500) setQuestionError("Ошибка сервера при загрузке вопроса");
        else setQuestionError("Не удалось загрузить вопрос");
      } else {
        setQuestionError("Не удалось загрузить вопрос");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const created = await addComment(Number(id), text, replyTo?.id ?? null);
      setText("");
      setReplyTo(null);
      setMessage("Комментарий добавлен");
      // Добавляем комментарий сразу в список, чтобы не требовать перезагрузку страницы.
      setComments((prev) => [...prev, created]);
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

  const onToggleLike = async (comment: Comment) => {
    setMessage("");

    try {
      const result = await toggleCommentLike(comment.id);
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? { ...c, likesCount: result.likesCount, likedByCurrentUser: result.likedByCurrentUser }
            : c
        )
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const payload = error.response.data as { message?: string } | undefined;

        if (status === 401) setMessage("Необходимо войти в систему");
        else if (status === 403) setMessage(payload?.message ?? "Недостаточно прав для лайка");
        else if (status === 400) {
          const backendMessage = payload?.message ?? "Не удалось обновить лайк";
          setMessage(backendMessage.includes("собствен") ? "Нельзя лайкнуть собственный комментарий" : backendMessage);
        } else if (status === 404) {
          setMessage("Комментарий не найден");
        } else if (status >= 500) {
          setMessage("Ошибка сервера при обновлении лайка");
        } else {
          setMessage("Не удалось обновить лайк");
        }
      } else {
        setMessage("Не удалось обновить лайк");
      }
    }
  };

  const onAcceptAnswer = async (commentId: number) => {
    if (!question) return;
    setMessage("");

    try {
      const updated = await acceptAnswer(question.id, commentId);
      setQuestion(updated);
      setComments((prev) => prev.map((c) => ({ ...c, acceptedAnswer: c.id === commentId })));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setMessage("Только автор вопроса может выбрать лучший ответ");
      } else {
        setMessage("Не удалось отметить лучший ответ");
      }
    }
  };

  const onClearAcceptedAnswer = async () => {
    if (!question) return;
    setMessage("");

    try {
      const updated = await clearAcceptedAnswer(question.id);
      setQuestion(updated);
      setComments((prev) => prev.map((c) => ({ ...c, acceptedAnswer: false })));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setMessage("Только автор вопроса может снять лучший ответ");
      } else {
        setMessage("Не удалось снять лучший ответ");
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

  const isUserRole = role === "USER";
  const isQuestionAuthor = Boolean(question && isUserRole && userId && question.authorId === userId);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-28 animate-pulse rounded-xl bg-zinc-900/70" />
        <div className="h-48 animate-pulse rounded-xl bg-zinc-900/70" />
      </div>
    );
  }

  if (questionError) {
    return (
      <Card>
        <p className="text-red-400">{questionError}</p>
      </Card>
    );
  }

  if (!question) {
    return (
      <Card>
        <p className="text-red-400">Вопрос не найден</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card title={question.title}>
        <p className="mb-3 text-textSecondary">{question.body}</p>
        <div className="flex items-center gap-3 text-xs text-textSecondary">
          <span>Автор: {question.authorId}</span>
          <span>Статус: {question.solved ? "✔ Решено" : question.status}</span>
          <Link to={`/users/${question.authorId}`} className="text-appAccent">
            Профиль автора
          </Link>
        </div>
      </Card>

      <Card title="Обсуждение">
        {commentsError && <p className="mb-3 text-sm text-red-400">{commentsError}</p>}
        {threadedComments.length === 0 && <p className="mb-3 text-textSecondary">Комментариев пока нет</p>}

        <div className="space-y-2">
          {threadedComments.map(({ comment, level }) => {
            const parent = comment.parentCommentId ? commentsById.get(comment.parentCommentId) : null;
            const canReply = !isAdmin && isUserRole && !comment.deleted && level === 0;
            const canLike = !isAdmin && isUserRole && !comment.deleted && userId !== comment.authorId;
            const canAcceptAnswer =
              isQuestionAuthor && !comment.deleted && comment.id !== question.acceptedCommentId;

            return (
              <div
                key={comment.id}
                className={`rounded-xl bg-appHover p-3 text-sm transition hover:bg-zinc-800 ${
                  level === 1 ? "ml-6 border-l border-zinc-600" : ""
                } ${
                  comment.acceptedAnswer
                    ? "border border-appAccent shadow-[0_0_0_1px_rgba(29,185,84,0.35),0_0_18px_rgba(29,185,84,0.2)]"
                    : ""
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-textSecondary">{comment.authorUsername}</p>
                  {comment.acceptedAnswer && (
                    <span className="text-xs font-semibold text-appAccent">✔ Лучший ответ</span>
                  )}
                </div>

                {level === 1 && parent && (
                  <p className="mb-1 text-xs text-textSecondary">В ответ пользователю {parent.authorUsername}</p>
                )}

                <p>{comment.deleted ? "Комментарий удален модератором" : comment.text}</p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  {canReply && (
                    <button
                      onClick={() => setReplyTo(comment)}
                      className="text-appAccent transition hover:underline"
                    >
                      Ответить
                    </button>
                  )}

                  {canLike && (
                    <button
                      onClick={() => onToggleLike(comment)}
                      className={`rounded-full px-2 py-1 transition ${
                        comment.likedByCurrentUser
                          ? "bg-appAccent/20 text-appAccent"
                          : "bg-zinc-900 text-textSecondary hover:text-white"
                      }`}
                    >
                      Лайк {comment.likesCount}
                    </button>
                  )}

                  {canAcceptAnswer && (
                    <button
                      onClick={() => onAcceptAnswer(comment.id)}
                      className="text-appAccent transition hover:underline"
                    >
                      Отметить как лучший ответ
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isQuestionAuthor && question.acceptedCommentId !== null && (
          <button
            onClick={onClearAcceptedAnswer}
            className="mt-3 text-sm text-appAccent transition hover:underline"
          >
            Снять лучший ответ
          </button>
        )}
      </Card>

      {!isAdmin && isUserRole && (
        <Card title="Добавить комментарий">
          <form onSubmit={submit} className="space-y-3">
            {replyTo && (
              <div className="rounded-xl bg-zinc-900 p-2 text-xs text-textSecondary">
                <p>Ответ пользователю {replyTo.authorUsername}</p>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="mt-1 text-appAccent hover:underline"
                >
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
            <button className="rounded-xl bg-appAccent px-4 py-2 text-black transition hover:brightness-110">
              Отправить
            </button>
          </form>
        </Card>
      )}
    </div>
  );
};
