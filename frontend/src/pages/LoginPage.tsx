import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ username, password });
      login(data);
      navigate("/");
    } catch {
      setError("Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-appBg p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl bg-appCard p-6">
        <h1 className="mb-5 text-2xl font-bold text-white">Вход</h1>
        <div className="space-y-4">
          <Input label="Логин" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Вход..." : "Войти"}</Button>
          <p className="text-sm text-textSecondary">Нет аккаунта? <Link to="/register" className="text-appAccent">Регистрация</Link></p>
        </div>
      </form>
    </div>
  );
};
