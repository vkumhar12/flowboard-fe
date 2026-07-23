import axios, { type AxiosError } from "axios";

const TOKEN_KEY = "kanban_token";

export const getToken = (): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + TOKEN_KEY + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

export const setToken = (token: string): void => {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=31536000; SameSite=Lax`;
};

export const clearToken = (): void => {
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5050/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

// Normalize errors to a readable message; bounce to login on 401.
interface ApiErrorBody {
  status?: string;
  message?: string;
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorBody>) => {
    const message = error.response?.data?.message || error.message || "Something went wrong";
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      if (!location.pathname.startsWith("/login")) location.assign("/login");
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
