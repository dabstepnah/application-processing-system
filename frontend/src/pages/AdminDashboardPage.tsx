import { Card } from "../components/Card";

export const AdminDashboardPage = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <Card title="Панель администратора">
      <p className="text-textSecondary">Здесь доступны только модерационные функции UniThread.</p>
    </Card>
    <Card title="Ограничения администратора">
      <ul className="list-disc pl-5 text-sm text-textSecondary">
        <li>Нельзя создавать вопросы</li>
        <li>Нельзя оставлять комментарии</li>
        <li>Нельзя ставить оценки и писать отзывы</li>
      </ul>
    </Card>
  </div>
);
