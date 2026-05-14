import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getQuestions, searchQuestions } from "../api/ticketApi";
import { Card } from "../components/Card";
import type { Question } from "../types";

const statusMap: Record<string, string> = {
  OPEN: "Открыт",
  DISCUSSION: "Обсуждение",
  SOLVED: "Решено",
  RESOLVED: "Решен",
  CLOSED: "Закрыт"
};

export const FeedPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "popular">("newest");

  const loadQuestions = async () => {
    setLoading(true);
    try {
      if (activeQuery.trim()) {
        const data = await searchQuestions(activeQuery.trim(), sort);
        setQuestions(data);
      } else {
        const data = await getQuestions({ sort });
        setQuestions(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQuestions();
  }, [sort, activeQuery]);

  const onSearch = async (e: FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchValue);
  };

  return (
    <div className="space-y-4">
      <Card title="Лента вопросов">
        <form onSubmit={onSearch} className="flex flex-col gap-3 md:flex-row">
          <input
            className="w-full rounded-xl border border-zinc-700 bg-appHover p-3 text-white transition focus:border-appAccent"
            placeholder="Поиск вопросов..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSort("newest")}
              className={`rounded-xl px-4 py-2 text-sm transition ${sort === "newest" ? "bg-appAccent text-black" : "bg-zinc-800 text-white hover:bg-zinc-700"}`}
            >
              Новые
            </button>
            <button
              type="button"
              onClick={() => setSort("popular")}
              className={`rounded-xl px-4 py-2 text-sm transition ${sort === "popular" ? "bg-appAccent text-black" : "bg-zinc-800 text-white hover:bg-zinc-700"}`}
            >
              Популярные
            </button>
          </div>
        </form>
      </Card>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-32 animate-pulse rounded-xl bg-zinc-900/70" />
          ))}
        </div>
      )}

      {!loading && questions.length === 0 && (
        <Card>
          <p className="text-textSecondary">{activeQuery ? "Ничего не найдено" : "Вопросов пока нет"}</p>
        </Card>
      )}

      {!loading && questions.map((q) => (
        <Card key={q.id} title={q.title}>
          <p className="mb-2 line-clamp-3 text-textSecondary">{q.body}</p>

          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-textSecondary">
            <span>Автор ID: {q.authorId}</span>
            <span>Статус: {q.solved ? "✔ Решено" : statusMap[q.status]}</span>
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
