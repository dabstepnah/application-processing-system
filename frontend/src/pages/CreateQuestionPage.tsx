import { FormEvent, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { createQuestion } from "../api/ticketApi";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";

const MIN_TITLE_LENGTH = 8;
const MIN_CONTENT_LENGTH = 12;

export const CreateQuestionPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (title.trim().length < MIN_TITLE_LENGTH) {
      setMessage(`Заголовок слишком короткий (минимум ${MIN_TITLE_LENGTH} символов)`);
      return;
    }

    if (content.trim().length < MIN_CONTENT_LENGTH) {
      setMessage(`Текст вопроса слишком короткий (минимум ${MIN_CONTENT_LENGTH} символов)`);
      return;
    }

    try {
      await createQuestion(title.trim(), content.trim());
      setMessage("Вопрос успешно создан");
      setTimeout(() => navigate("/"), 600);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const payload = error.response.data as { message?: string } | undefined;
        setMessage(payload?.message ?? "Не удалось создать вопрос");
      } else {
        setMessage("Не удалось создать вопрос");
      }
    }
  };

  return (
    <Card title="Создать вопрос">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label className="flex flex-col gap-2 text-sm text-textSecondary">
          Текст вопроса
          <textarea
            className="min-h-40 rounded-xl border border-zinc-700 bg-appHover p-3 text-white"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </label>

        {message && <p className="text-sm text-appAccent">{message}</p>}
        <Button type="submit">Опубликовать</Button>
      </form>
    </Card>
  );
};
