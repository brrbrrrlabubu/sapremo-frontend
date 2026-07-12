import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { SyncQueue } from '../services/syncQueue';
import { 
  isValidStatusTransition, 
  checkStockAvailability, 
  calculateUpdatedStock 
} from '../utils/requestAlgorithms';
import type { WarehouseRequest, RequestStatus } from '../utils/requestAlgorithms';

// Описываем контракт для стора Нурсултана, чтобы TypeScript не ругался до того,
// как Нурсултан напишет свой Zustand-стор.
interface RequestStorePlaceholder {
  updateRequestStatus: (id: string, status: RequestStatus) => Promise<void>;
  updateFactoryStock: (newStock: Record<string, number>) => Promise<void>;
  factoryStock: Record<string, number>;
}

export const useRequestOperations = (store: RequestStorePlaceholder) => {
  const { t } = useTranslation();

  const handleStatusChange = async (request: WarehouseRequest, nextStatus: RequestStatus) => {
    // 1. Проверяем, допустим ли такой переход по нашей State Machine
    if (!isValidStatusTransition(request.status, nextStatus)) {
      message.error('Ошибка: Неверная последовательность смены статуса!');
      return false;
    }

    // 2. Бизнес-логика: если заявку утверждают (APPROVED), проверяем склад завода
    if (nextStatus === 'APPROVED') {
      const { isAvailable, deficit } = checkStockAvailability(request.items, store.factoryStock);

      if (!isAvailable) {
        // Формируем понятный лог дефицита для менеджера
        const deficitDetails = deficit
          .map(d => `Товар ${d.productId} (Надо: ${d.requested}, В наличии: ${d.available})`)
          .join(', ');
        
        message.error(`${t('validation.insufficientStock')} Дефицит: ${deficitDetails}`);
        return false;
      }

      // Если товара хватает — уменьшаем виртуальные остатки на заводе (бронируем)
      const newStock = calculateUpdatedStock(request.items, store.factoryStock);
      await store.updateFactoryStock(newStock);
    }

    // 3. Если все проверки прошли — меняем статус самой заявки
    await store.updateRequestStatus(request.id, nextStatus);
    
    // Выводим мультиязычное сообщение об успехе
    const statusText = t(`status.${nextStatus.toLowerCase()}`);
    message.success(`Статус заявки успешно изменен на: "${statusText}"`);
    
    return true;
  };

  return { handleStatusChange };
};

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