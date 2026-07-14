import { axiosClient } from '../api/axiosClient';
import type { OfflineQueueItem } from '../types/api.types';

export class SyncQueue {
  private static STORAGE_KEY = 'offline_sync_queue';
  private static isProcessing = false;

  public static enqueue(endpoint: string, method: OfflineQueueItem['method'], payload: Record<string, unknown>): void {
    const queue = this.getQueue();
    const newItem: OfflineQueueItem = {
      id: crypto.randomUUID(),
      endpoint,
      method,
      payload,
      timestamp: new Date().toISOString(),
    };
    queue.push(newItem);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    
    // Попытка триггера отправки, если сеть доступна
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  public static getQueue(): OfflineQueueItem[] {
    const rawData = localStorage.getItem(this.STORAGE_KEY);
    if (!rawData) return [];
    try {
      return JSON.parse(rawData) as OfflineQueueItem[];
    } catch {
      return [];
    }
  }

  /**
   * Боевой сетевой режим: Последовательная выгрузка офлайн операций на бэкенд
   */
  public static async processQueue(): Promise<void> {
    // Guard Clauses: блокировка двойной обработки или работы без сети
    if (this.isProcessing || !navigator.onLine) return;

    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isProcessing = true;

    // Использование классического цикла for..of для обеспечения строгой очередности (FIFO)
    for (const item of queue) {
      try {
        await axiosClient.post('/sync/push/', item);
        
        // Удаляем успешно синхронизированный элемент из локального стейта
        this.removeItemFromQueue(item.id);
      } catch (error) {
        console.error(`Ошибка при фоновой синхронизации элемента ${item.id}:`, error);
        // При критической ошибке сети (например, 503) останавливаем дальнейший процессинг до следующего цикла
        break;
      }
    }

    this.isProcessing = false;
  }

  private static removeItemFromQueue(id: string): void {
    const queue = this.getQueue().filter((item) => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
  }
}

// Слушатели событий браузера для автоматической реактивности синхронизации
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => SyncQueue.processQueue());
}