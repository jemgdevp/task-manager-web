import axios from "axios";

export const AUTH_TOKEN_KEY = "auth_token";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000, // 10 seconds
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = {
      status: error?.response?.status ?? 500,
      message:
        error?.response?.data?.message ??
        error?.message ??
        "Unexpected API error.",
      data: error?.response?.data ?? null,
      originalError: error,
    };

    return Promise.reject(normalizedError);
  },
);

export { api };

export default api;
