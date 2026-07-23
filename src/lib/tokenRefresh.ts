/**
 * Единый модуль обновления токенов.
 *
 * ПРОБЛЕМА, которую решаем:
 * axiosClient и driverAxiosClient имели НЕЗАВИСИМЫЕ isRefreshing/failedQueue.
 * При одновременном 401 от обоих клиентов — оба запускали refresh параллельно.
 * Первый получал новую пару токенов, второй получал 401 на уже истёкший refresh,
 * сбрасывал сессию и редиректил на /login прямо посреди работы.
 *
 * РЕШЕНИЕ: один глобальный промис refresh, shared между всеми клиентами.
 */

import axios from 'axios';
import { strictValidate } from './safeValidate';
import { LoginResponseSchema } from '../schemas/apiSchemas';

const FACTORY_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://factory-service-ab3j.onrender.com/api/factory';

// Единый navigate — устанавливается из MainLayout один раз
let _navigate: ((path: string) => void) | null = null;
export const setGlobalNavigate = (fn: (path: string) => void): void => {
  _navigate = fn;
};

// ─── Shared refresh state ────────────────────────────────────────────────────
let refreshingPromise: Promise<string> | null = null;

type QueueItem = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
let failedQueue: QueueItem[] = [];

const flushQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((item) => {
    if (token) item.resolve(token);
    else item.reject(error);
  });
  failedQueue = [];
};

/** Добавляет запрос в очередь ожидания рефреша и возвращает промис с новым токеном */
export const waitForRefresh = (): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  });

/**
 * Запускает refresh (если уже запущен — возвращает тот же промис).
 * Все вызовы получают один и тот же новый access token.
 */
export const refreshAccessToken = (): Promise<string> => {
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      logout();
      throw new Error('No refresh token');
    }

    try {
      const response = await axios.post(
        `${FACTORY_BASE_URL}/auth/refresh/`,
        { refresh: refreshToken },
        { timeout: 10_000 }
      );

      // Строгая валидация — если структура токена неожиданная, лучше разлогинить
      const partial = { access: response.data.access, refresh: response.data.refresh };
      const validated = strictValidate(
        LoginResponseSchema.pick({ access: true, refresh: true }),
        partial,
        'Token refresh'
      );

      localStorage.setItem('access_token', validated.access);
      localStorage.setItem('refresh_token', validated.refresh);

      flushQueue(null, validated.access);
      return validated.access;
    } catch (err) {
      flushQueue(err, null);
      logout();
      throw err;
    } finally {
      refreshingPromise = null;
    }
  })();

  return refreshingPromise;
};

/** Полный сброс сессии с редиректом на /login */
export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  if (_navigate) {
    _navigate('/login');
  } else {
    window.location.href = '/login';
  }
};
