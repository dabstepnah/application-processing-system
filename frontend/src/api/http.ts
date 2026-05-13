import axios from "axios";

// Общий helper для получения JWT из localStorage.
export const getToken = () => localStorage.getItem("token");

export const createApiClient = (baseURL: string) => {
  const instance = axios.create({ baseURL });

  // Автоматически добавляем Bearer токен в каждый запрос.
  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};
