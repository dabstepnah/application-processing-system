import { useAuth } from "../context/AuthContext";

export const Header = () => {
  const { username, role } = useAuth();
  return (
    <header className="mb-4 flex items-center justify-between rounded-xl bg-appCard p-4">
      <div>
        <h2 className="text-lg font-semibold text-white">UniThread</h2>
        <p className="text-sm text-textSecondary">Университетская Q&A-платформа</p>
      </div>
      <div className="rounded-xl bg-appHover px-3 py-2 text-sm text-textSecondary">
        {username} <span className="text-appAccent">({role})</span>
      </div>
    </header>
  );
};
