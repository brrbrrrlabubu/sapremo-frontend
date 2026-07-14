import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Singleton-навигатор — устанавливается из React-контекста (MainLayout) через setNavigate.
// Позволяет перенаправлять на /login без полной перезагрузки страницы.
let _navigate: ((path: string) => void) | null = null;
export const setNavigate = (fn: (path: string) => void) => { _navigate = fn; };

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://factory-service-ab3j.onrender.com/api/factory';

export const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Request Interceptor: внедрение Access Token в заголовки
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: автоматический Silent Refresh токенов при 401 ошибке
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      isRefreshing = false;
      // Перенаправляем на логику логаута/очистки стейта, если refresh-токен отсутствует
      return Promise.reject(error);
    }

    try {
      const response = await axios.post<{ access: string; refresh: string }>(`${BASE_URL}/auth/refresh`, {
        refresh: refreshToken,
      });

      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      processQueue(null, access);
      isRefreshing = false;

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access}`;
      }
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      // Принудительный сброс сессии
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (_navigate) {
        _navigate('/login');
      } else {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    }
  }
);