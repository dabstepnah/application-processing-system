import { useEffect, useState } from "react";
import { fetchUsers } from "../api/authApi";
import { getQuestionStatistics } from "../api/ticketApi";
import { Card } from "../components/Card";
import type { QuestionStatistics, User } from "../types";

export const StatisticsPage = () => {
  const [stats, setStats] = useState<QuestionStatistics | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    void getQuestionStatistics().then(setStats);
    void fetchUsers().then(setUsers);
  }, []);

  const bannedUsers = users.filter((u) => u.banned).length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Пользователи"><p className="text-3xl font-bold text-appAccent">{users.length}</p></Card>
      <Card title="Заблокированные"><p className="text-3xl font-bold text-appAccent">{bannedUsers}</p></Card>
      <Card title="Всего вопросов"><p className="text-3xl font-bold text-appAccent">{stats?.totalQuestions ?? 0}</p></Card>
      <Card title="Открытые"><p className="text-3xl font-bold text-appAccent">{stats?.openQuestions ?? 0}</p></Card>
      <Card title="Обсуждение"><p className="text-3xl font-bold text-appAccent">{stats?.discussionQuestions ?? 0}</p></Card>
      <Card title="Решенные"><p className="text-3xl font-bold text-appAccent">{stats?.resolvedQuestions ?? 0}</p></Card>
      <Card title="Закрытые"><p className="text-3xl font-bold text-appAccent">{stats?.closedQuestions ?? 0}</p></Card>
      <Card title="Комментариев"><p className="text-3xl font-bold text-appAccent">{stats?.totalComments ?? 0}</p></Card>
    </div>
  );
};
