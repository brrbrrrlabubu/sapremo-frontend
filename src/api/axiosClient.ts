import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { refreshAccessToken, waitForRefresh, logout } from '../lib/tokenRefresh';
import { SyncQueue } from '../services/syncQueue';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://factory-service-ab3j.onrender.com/api/factory';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ─── Request: inject access token ───────────────────────────────────────────
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response: 401 silent refresh + offline queue ───────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
      _queued?: boolean;
    };

    // ── Оффлайн: сохраняем мутирующие запросы в очередь ─────────────────────
    if (
      !navigator.onLine &&
      !originalRequest._queued &&
      originalRequest.method &&
      ['post', 'put', 'patch', 'delete'].includes(originalRequest.method.toLowerCase())
    ) {
      originalRequest._queued = true;
      SyncQueue.enqueue(
        originalRequest.url ?? '',
        originalRequest.method.toUpperCase() as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        (originalRequest.data
          ? typeof originalRequest.data === 'string'
            ? JSON.parse(originalRequest.data)
            : originalRequest.data
          : {}) as Record<string, unknown>
      );
      // Возвращаем "mock success" чтобы не ломать UI — реальный результат придёт при синхронизации
      return Promise.resolve({ data: { queued: true }, status: 202, headers: {}, config: originalRequest, statusText: 'Queued' });
    }

    // ── 401: silent token refresh ────────────────────────────────────────────
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Если refresh уже идёт — ждём его результат из shared queue
      const isAlreadyRefreshing = !!localStorage.getItem('_refreshing');
      const newToken = isAlreadyRefreshing
        ? await waitForRefresh()
        : await refreshAccessToken();

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return axiosClient(originalRequest);
    } catch {
      logout();
      return Promise.reject(error);
    }
  }
);