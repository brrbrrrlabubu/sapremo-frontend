import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { refreshAccessToken, waitForRefresh, logout } from '../lib/tokenRefresh';

const DRIVERS_BASE_URL = 'https://sapremo-drivers-backend.onrender.com/api/drivers';

export const driverAxiosClient = axios.create({
  baseURL: DRIVERS_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Request: inject access token ───────────────────────────────────────────
driverAxiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response: 401 silent refresh (shared с axiosClient) ────────────────────
driverAxiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Используем тот же глобальный промис — гонки нет
      const isAlreadyRefreshing = !!localStorage.getItem('_refreshing');
      const newToken = isAlreadyRefreshing
        ? await waitForRefresh()
        : await refreshAccessToken();

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return driverAxiosClient(originalRequest);
    } catch {
      logout();
      return Promise.reject(error);
    }
  }
);
