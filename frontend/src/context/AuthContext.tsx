import { createContext, useContext, useMemo, useState } from "react";
import type { AuthResponse, AuthState } from "../types";

interface AuthContextValue extends AuthState {
  login: (payload: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  userId: Number(localStorage.getItem("userId")) || null,
  username: localStorage.getItem("username"),
  role: (localStorage.getItem("role") as AuthState["role"]) ?? null
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Централизованно сохраняем сессию пользователя.
  const login = (payload: AuthResponse) => {
    localStorage.setItem("token", payload.token);
    localStorage.setItem("userId", String(payload.userId));
    localStorage.setItem("username", payload.username);
    localStorage.setItem("role", payload.role);
    setState(payload);
  };

  const logout = () => {
    localStorage.clear();
    setState({ token: null, userId: null, username: null, role: null });
  };

  const value = useMemo(
    () => ({ ...state, login, logout, isAuthenticated: Boolean(state.token), isAdmin: state.role === "ADMIN" }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth должен использоваться внутри AuthProvider");
  return context;
};
