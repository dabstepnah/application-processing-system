import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-3 py-2 text-sm transition ${isActive ? "bg-appAccent text-black" : "text-textSecondary hover:bg-appHover hover:text-white"}`;

export const Sidebar = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-full max-w-64 rounded-xl bg-appCard p-4">
      <h1 className="mb-6 text-xl font-bold text-white">UniThread</h1>
      <nav className="flex flex-col gap-2">
        {!isAdmin && <NavLink to="/" className={linkClass}>Лента</NavLink>}
        {!isAdmin && <NavLink to="/questions/new" className={linkClass}>Создать вопрос</NavLink>}
        {!isAdmin && <NavLink to="/my-questions" className={linkClass}>Мои вопросы</NavLink>}
        {!isAdmin && <NavLink to="/my-profile" className={linkClass}>Мой профиль</NavLink>}

        {isAdmin && <NavLink to="/admin" className={linkClass}>Админ-панель</NavLink>}
        {isAdmin && <NavLink to="/admin/users" className={linkClass}>Пользователи</NavLink>}
        {isAdmin && <NavLink to="/admin/questions" className={linkClass}>Вопросы</NavLink>}
        {isAdmin && <NavLink to="/admin/comments" className={linkClass}>Комментарии</NavLink>}
        {isAdmin && <NavLink to="/admin/reviews" className={linkClass}>Отзывы</NavLink>}
        {isAdmin && <NavLink to="/admin/statistics" className={linkClass}>Статистика</NavLink>}

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="mt-2 rounded-xl px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
        >
          Выйти
        </button>
      </nav>
    </aside>
  );
};
