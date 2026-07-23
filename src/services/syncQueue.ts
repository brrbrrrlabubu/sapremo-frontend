import { axiosClient } from '../api/axiosClient';
import { notification } from 'antd';

// ─── Типы ────────────────────────────────────────────────────────────────────
export type HttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface OfflineQueueItem {
  id: string;
  endpoint: string;
  method: HttpMethod;
  payload: Record<string, unknown>;
  timestamp: string;
  retryCount: number;       // Сколько раз уже пытались
  maxRetries: number;       // Максимальное количество попыток
  lastError?: string;       // Последняя ошибка для диагностики
}

// ─── Константы ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'offline_sync_queue';
const DEFAULT_MAX_RETRIES = 5;
const BASE_BACKOFF_MS = 1_000; // 1s, 2s, 4s, 8s, 16s

// ─── SyncQueue ───────────────────────────────────────────────────────────────
export class SyncQueue {
  private static isProcessing = false;

  // ── Добавление в очередь ──────────────────────────────────────────────────
  static enqueue(
    endpoint: string,
    method: HttpMethod,
    payload: Record<string, unknown>,
    maxRetries = DEFAULT_MAX_RETRIES
  ): void {
    const queue = this.getQueue();

    const item: OfflineQueueItem = {
      id: crypto.randomUUID(),
      endpoint,
      method,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries,
    };

    queue.push(item);
    this.saveQueue(queue);

    // Уведомляем пользователя, что операция сохранена оффлайн
    notification.info({
      message: 'Нет соединения',
      description: 'Операция сохранена и будет отправлена автоматически при восстановлении связи.',
      duration: 4,
      placement: 'topRight',
    });
  }

  // ── Чтение очереди ────────────────────────────────────────────────────────
  static getQueue(): OfflineQueueItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as OfflineQueueItem[];
    } catch {
      return [];
    }
  }

  // ── Количество элементов в очереди ───────────────────────────────────────
  static getPendingCount(): number {
    return this.getQueue().length;
  }

  // ── Обработка очереди (FIFO + exponential backoff) ────────────────────────
  static async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) return;

    const queue = this.getQueue();
    if (queue.length === 0) return;

    this.isProcessing = true;

    let successCount = 0;
    let failedCount = 0;

    for (const item of queue) {
      const success = await this.sendItem(item);
      if (success) {
        successCount++;
        this.removeItem(item.id);
      } else {
        failedCount++;
        this.incrementRetry(item);
        // Если сеть пропала — прекращаем попытки до следующего события online
        if (!navigator.onLine) break;
      }
    }

    this.isProcessing = false;

    if (successCount > 0) {
      notification.success({
        message: 'Синхронизация выполнена',
        description: `Успешно отправлено ${successCount} операций.`,
        duration: 3,
        placement: 'topRight',
      });
    }

    if (failedCount > 0) {
      const remaining = this.getQueue();
      const deadItems = remaining.filter((i) => i.retryCount >= i.maxRetries);
      if (deadItems.length > 0) {
        // Элементы исчерпали попытки — помечаем как dead и уведомляем
        this.handleDeadLetters(deadItems);
      }
    }
  }

  // ── Отправка одного элемента с retry-логикой ─────────────────────────────
  private static async sendItem(item: OfflineQueueItem): Promise<boolean> {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s (не блокируем при первой попытке)
    if (item.retryCount > 0) {
      const delay = Math.min(BASE_BACKOFF_MS * 2 ** (item.retryCount - 1), 30_000);
      await sleep(delay);
    }

    try {
      await axiosClient.request({
        url: item.endpoint,
        method: item.method,
        data: item.payload,
        // Флаг чтобы оффлайн-перехватчик не зациклился на этом запросе
        headers: { 'X-Sync-Queue': 'true' },
      });
      return true;
    } catch (error: unknown) {
      const status = (error as { response?: { status: number } })?.response?.status;

      // 4xx (кроме 429 Too Many Requests) — данные невалидны, retry бессмысленен
      if (status && status >= 400 && status < 500 && status !== 429) {
        this.removeItem(item.id);
        notification.error({
          message: 'Оффлайн-операция отклонена',
          description: `Операция ${item.method} ${item.endpoint} отклонена сервером (${status}). Данные могут быть устаревшими.`,
          duration: 8,
        });
        return true; // true чтобы не считать как retry-failure
      }

      // 5xx или сетевые ошибки — попробуем ещё
      return false;
    }
  }

  // ── Dead letter handling ──────────────────────────────────────────────────
  private static handleDeadLetters(items: OfflineQueueItem[]): void {
    // Удаляем из очереди
    items.forEach((item) => this.removeItem(item.id));

    // Сохраняем в отдельное хранилище для ручного разбора
    const deadKey = 'offline_dead_letters';
    const existing = JSON.parse(localStorage.getItem(deadKey) ?? '[]') as OfflineQueueItem[];
    localStorage.setItem(deadKey, JSON.stringify([...existing, ...items]));

    notification.error({
      message: 'Не удалось синхронизировать',
      description: `${items.length} операций не удалось отправить после ${DEFAULT_MAX_RETRIES} попыток. Обратитесь в поддержку или обновите данные вручную.`,
      duration: 10,
    });
  }

  // ── Вспомогательные методы ────────────────────────────────────────────────
  private static saveQueue(queue: OfflineQueueItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }

  private static removeItem(id: string): void {
    const queue = this.getQueue().filter((item) => item.id !== id);
    this.saveQueue(queue);
  }

  private static incrementRetry(item: OfflineQueueItem): void {
    const queue = this.getQueue();
    const idx = queue.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      queue[idx].retryCount += 1;
      this.saveQueue(queue);
    }
  }

  /** Полная очистка очереди (например, при logout) */
  static clearQueue(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Вернуть dead letters для UI диагностики */
  static getDeadLetters(): OfflineQueueItem[] {
    try {
      return JSON.parse(localStorage.getItem('offline_dead_letters') ?? '[]') as OfflineQueueItem[];
    } catch {
      return [];
    }
  }
}

// ─── Слушатели сети ──────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // Небольшая задержка — дать сети стабилизироваться
    setTimeout(() => SyncQueue.processQueue(), 1_500);
  });
}

// ─── Хелпер ──────────────────────────────────────────────────────────────────
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));