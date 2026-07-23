import { useCallback, useState } from 'react';
import { App } from 'antd';
import { SyncQueue } from '../services/syncQueue';
import { WarehouseOrderService } from '../services/warehouseOrder.service';
import type { WarehouseOrder } from '../types/api.types';

// ─── Типы ─────────────────────────────────────────────────────────────────────
export interface ApiOperationFallback {
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'GET';
  payload: Record<string, unknown>;
}

export interface ApiOperationOptions {
  /** При отсутствии сети — сохранить в SyncQueue вместо ошибки */
  offlineFallback?: boolean;
  /** Сообщение при успехе (показывается через Ant message) */
  successMessage?: string;
  /** Сообщение при ошибке */
  errorMessage?: string;
}

// ─── useApiOperation ─────────────────────────────────────────────────────────
/**
 * Высокоуровневый контроллер Online/Offline маршрутизации.
 *
 * Поведение:
 * - Онлайн → выполняет apiCall напрямую.
 * - Оффлайн + offlineFallback → enqueue в SyncQueue, возвращает null.
 * - Ошибка → пробрасывает exception для обработки вызывающим кодом.
 */
export function useApiOperation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);
  const { message } = App.useApp();

  const execute = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      fallback: ApiOperationFallback,
      options?: ApiOperationOptions
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      setIsOfflineQueued(false);

      // ── Оффлайн-путь ──────────────────────────────────────────────────────
      if (!navigator.onLine && options?.offlineFallback) {
        try {
          if (fallback.method !== 'GET') {
            SyncQueue.enqueue(
              fallback.endpoint,
              fallback.method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
              fallback.payload
            );
          }
          setIsOfflineQueued(true);
          setIsLoading(false);
          return null;
        } catch (queueError) {
          const msg =
            queueError instanceof Error
              ? queueError.message
              : 'Ошибка записи в офлайн-очередь';
          setError(msg);
          setIsLoading(false);
          return null;
        }
      }

      // ── Онлайн-путь ───────────────────────────────────────────────────────
      try {
        const result = await apiCall();
        setIsLoading(false);
        if (options?.successMessage) {
          message.success(options.successMessage);
        }
        return result;
      } catch (apiError) {
        const msg =
          apiError instanceof Error ? apiError.message : 'Неизвестная ошибка операции';
        setError(msg);
        setIsLoading(false);
        if (options?.errorMessage) {
          message.error(options.errorMessage);
        }
        throw apiError;
      }
    },
    [message]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsOfflineQueued(false);
  }, []);

  return { isLoading, error, isOfflineQueued, execute, reset };
}

// ─── useWarehouseOrderOperations ──────────────────────────────────────────────
/**
 * Специализированный хук для CRUD-операций над заявками склада.
 *
 * Инкапсулирует:
 * - createOrder (с offline-fallback)
 * - cancelOrder (с offline-fallback)
 * - confirmOrder (смена статуса, только онлайн)
 *
 * Все операции возвращают boolean-успех и уведомляют через Ant message.
 */
export function useWarehouseOrderOperations(onSuccess?: () => void) {
  const { execute, isLoading, isOfflineQueued } = useApiOperation();

  const createOrder = useCallback(
    async (data: Record<string, unknown>): Promise<WarehouseOrder | null> => {
      return execute(
        () => WarehouseOrderService.createOrder(data),
        {
          endpoint: '/warehouse-orders/',
          method: 'POST',
          payload: data,
        },
        {
          offlineFallback: true,
          successMessage: 'Заявка создана',
          errorMessage: 'Не удалось создать заявку',
        }
      ).then((result) => {
        if (result !== undefined) onSuccess?.();
        return result;
      });
    },
    [execute, onSuccess]
  );

  const cancelOrder = useCallback(
    async (orderId: string): Promise<boolean> => {
      try {
        await execute(
          () => WarehouseOrderService.cancelOrder(orderId),
          {
            endpoint: `/warehouse-orders/${orderId}/`,
            method: 'PATCH',
            payload: { status: 'cancelled' },
          },
          {
            offlineFallback: true,
            successMessage: 'Заявка отменена',
            errorMessage: 'Не удалось отменить заявку',
          }
        );
        onSuccess?.();
        return true;
      } catch {
        return false;
      }
    },
    [execute, onSuccess]
  );

  const confirmOrder = useCallback(
    async (orderId: string, status: string): Promise<boolean> => {
      try {
        await execute(
          () => WarehouseOrderService.updateStatus(orderId, status),
          {
            endpoint: `/warehouse-orders/${orderId}/status`,
            method: 'PUT',
            payload: { status },
          },
          {
            offlineFallback: false,
            successMessage: 'Статус заявки обновлён',
            errorMessage: 'Не удалось обновить статус',
          }
        );
        onSuccess?.();
        return true;
      } catch {
        return false;
      }
    },
    [execute, onSuccess]
  );

  return { createOrder, cancelOrder, confirmOrder, isLoading, isOfflineQueued };
}