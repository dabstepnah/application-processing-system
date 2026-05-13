import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuestion } from "../api/ticketApi";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";

export const CreateQuestionPage = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createQuestion(title, body);
      setMessage("Вопрос успешно создан");
      setTimeout(() => navigate("/"), 600);
    } catch {
      setMessage("Не удалось создать вопрос");
    }
  };

  return (
    <Card title="Создать вопрос">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label className="flex flex-col gap-2 text-sm text-textSecondary">
          Текст вопроса
          <textarea className="min-h-40 rounded-xl border border-zinc-700 bg-appHover p-3 text-white" value={body} onChange={(e) => setBody(e.target.value)} required />
        </label>
        {message && <p className="text-sm text-appAccent">{message}</p>}
        <Button type="submit">Опубликовать</Button>
      </form>
    </Card>
  );
};
