import { useEffect, useState } from "react";
import { fetchUserById } from "../api/authApi";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";
import type { User } from "../types";

export const ProfilePage = () => {
  const { userId } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!userId) return;
    void fetchUserById(userId).then(setUser);
  }, [userId]);

  if (!user) return <Card><p className="text-textSecondary">Загрузка профиля...</p></Card>;

  return (
    <Card title="Профиль">
      <div className="space-y-2 text-textSecondary">
        <p><span className="text-white">Username:</span> {user.username}</p>
        <p><span className="text-white">Email:</span> {user.email}</p>
        <p><span className="text-white">Role:</span> {user.role}</p>
        <p><span className="text-white">Banned:</span> {String(user.banned)}</p>
      </div>
    </Card>
  );
};
