import { useEffect, useState } from "react";
import { banUser, fetchUsers, unbanUser } from "../api/authApi";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import type { User } from "../types";

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);

  const load = async () => setUsers(await fetchUsers());
  useEffect(() => { void load(); }, []);

  return (
    <Card title="Пользователи">
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between rounded-xl bg-appHover p-3">
            <div>
              <p className="font-medium">{u.username} <span className="text-appAccent">({u.role})</span></p>
              <p className="text-sm text-textSecondary">{u.email}</p>
            </div>
            {u.banned ? (
              <Button onClick={() => unbanUser(u.id).then(load)}>Разбан</Button>
            ) : (
              <Button variant="danger" onClick={() => banUser(u.id).then(load)}>Бан</Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
