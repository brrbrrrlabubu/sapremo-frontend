import { useCallback, useState } from 'react';
import { SyncQueue } from '../services/syncQueue';

// ---------------------------------------------------------------------------
// useApiOperation — высокоуровневый контроллер Online/Offline маршрутизации.
// Инкапсулирует: выполнение запроса в реальном времени при наличии сети,
// либо автоматическое перенаправление в отказоустойчивую офлайн-очередь (SyncQueue).
// ---------------------------------------------------------------------------

export interface ApiOperationFallback {
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'GET';
  payload: Record<string, unknown>;
}

export interface ApiOperationOptions {
  offlineFallback?: boolean;
}

export function useApiOperation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);

  const execute = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      fallback: ApiOperationFallback,
      options?: ApiOperationOptions
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      setIsOfflineQueued(false);

      // Проверка физического подключения устройства к сети
      if (!navigator.onLine && options?.offlineFallback) {
        try {
          // Изолированная инжекция транзакции в локальную очередь PWA
          SyncQueue.enqueue(fallback.endpoint, fallback.method as 'POST' | 'PUT' | 'PATCH' | 'DELETE', fallback.payload);
          setIsOfflineQueued(true);
          setIsLoading(false);
          return null;
        } catch (queueError) {
          const msg = queueError instanceof Error ? queueError.message : 'Ошибка записи в офлайн-очередь';
          setError(msg);
          setIsLoading(false);
          return null;
        }
      }

      try {
        const result = await apiCall();
        setIsLoading(false);
        return result;
      } catch (apiError) {
        const msg = apiError instanceof Error ? apiError.message : 'Неизвестная ошибка операции';
        setError(msg);
        setIsLoading(false);
        throw apiError;
      }
    },
    []
  );

  return { isLoading, error, isOfflineQueued, execute };
}