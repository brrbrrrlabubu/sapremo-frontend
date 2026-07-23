import { useState, useEffect, useCallback } from 'react';
import { SyncQueue } from '../services/syncQueue';

export interface NetworkStatus {
  isOnline: boolean;
  pendingCount: number;        // Количество операций в очереди
  isSyncing: boolean;          // Идёт ли синхронизация прямо сейчас
  triggerSync: () => Promise<void>; // Ручной триггер синхронизации
}

/**
 * Хук состояния сети и оффлайн-очереди.
 *
 * Использование:
 * const { isOnline, pendingCount } = useNetworkStatus();
 *
 * В MainLayout — показывай badge с pendingCount и предупреждение если !isOnline.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(SyncQueue.getPendingCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshPendingCount = useCallback(() => {
    setPendingCount(SyncQueue.getPendingCount());
  }, []);

  const triggerSync = useCallback(async () => {
    if (isSyncing || !navigator.onLine) return;
    setIsSyncing(true);
    try {
      await SyncQueue.processQueue();
    } finally {
      setIsSyncing(false);
      refreshPendingCount();
    }
  }, [isSyncing, refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      refreshPendingCount(); // Обновляем счётчик
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Слушаем изменения localStorage (другие вкладки могут добавлять в очередь)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'offline_sync_queue') {
        refreshPendingCount();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Периодически обновляем счётчик (раз в 5 сек, пока есть ожидающие)
    const interval = setInterval(() => {
      refreshPendingCount();
    }, 5_000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [triggerSync, refreshPendingCount]);

  return { isOnline, pendingCount, isSyncing, triggerSync };
}
