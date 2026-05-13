import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../context/AuthContext";

export const RegisterPage = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerUser(form);
      login(data);
      navigate("/");
    } catch {
      setError("Заполните обязательные поля или выберите другой логин/email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-appBg p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl bg-appCard p-6">
        <h1 className="mb-5 text-2xl font-bold text-white">Регистрация</h1>
        <div className="space-y-4">
          <Input label="Логин" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Пароль" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Регистрация..." : "Создать аккаунт"}</Button>
          <p className="text-sm text-textSecondary">Уже есть аккаунт? <Link to="/login" className="text-appAccent">Войти</Link></p>
        </div>
      </form>
    </div>
  );
};
