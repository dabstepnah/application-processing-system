import { createApiClient } from "./http";
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "../types";

const authApi = createApiClient("http://localhost:8081");

export const registerUser = async (payload: RegisterRequest) => {
  const { data } = await authApi.post<AuthResponse>("/api/auth/register", payload);
  return data;
};

export const loginUser = async (payload: LoginRequest) => {
  const { data } = await authApi.post<AuthResponse>("/api/auth/login", payload);
  return data;
};

export const fetchUsers = async () => {
  const { data } = await authApi.get<User[]>("/api/admin/users");
  return data;
};

export const banUser = async (id: number) => authApi.patch(`/api/admin/users/${id}/ban`);
export const unbanUser = async (id: number) => authApi.patch(`/api/admin/users/${id}/unban`);
export const fetchUserById = async (id: number) => {
  const { data } = await authApi.get<User>(`/api/users/${id}`);
  return data;
};
