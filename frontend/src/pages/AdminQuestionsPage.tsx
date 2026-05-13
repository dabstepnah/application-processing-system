import { useEffect, useState } from "react";
import { deleteQuestion, getAdminQuestions, updateQuestionStatus } from "../api/ticketApi";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import type { Question } from "../types";

export const AdminQuestionsPage = () => {
  const [items, setItems] = useState<Question[]>([]);

  const load = async () => setItems(await getAdminQuestions());
  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-4">
      {items.map((q) => (
        <Card key={q.id} title={q.title}>
          <p className="mb-3 text-textSecondary">{q.body}</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => updateQuestionStatus(q.id, "CLOSED").then(load)}>Закрыть</Button>
            <Button variant="danger" onClick={() => deleteQuestion(q.id).then(load)}>Удалить</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
