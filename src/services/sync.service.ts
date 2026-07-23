import { z } from 'zod';
import { axiosClient } from '../api/axiosClient';
import { SyncStatusSchema } from '../schemas/apiSchemas';
import { safeValidate, strictValidate } from '../lib/safeValidate';

// ─── SyncService ──────────────────────────────────────────────────────────────
export class SyncService {
  /**
   * Начальная загрузка данных при старте приложения.
   * Валидируем схемой — если структура сломана, лучше знать сразу.
   */
  static async getInitialData<T extends z.ZodTypeAny>(
    schema: T,
    context = 'Initial data'
  ): Promise<z.infer<T> | null> {
    const response = await axiosClient.get('/sync/initial/');
    const result = safeValidate(schema, response.data, context);
    return result.success ? result.data : null;
  }

  /**
   * Pull данных с сервера (периодическая синхронизация).
   */
  static async pullData<T extends z.ZodTypeAny>(
    schema: T,
    context = 'Pull sync'
  ): Promise<z.infer<T> | null> {
    const response = await axiosClient.get('/sync/pull/');
    const result = safeValidate(schema, response.data, context);
    return result.success ? result.data : null;
  }

  /**
   * Push данных на сервер.
   * Возвращает { success: true } или кидает ошибку — вызывающий код решает как обрабатывать.
   */
  static async pushData(payload: Record<string, unknown>): Promise<{ success: boolean }> {
    const response = await axiosClient.post('/sync/push/', payload);

    // Строгая валидация — если бэк не вернул success, лучше знать явно
    const data = strictValidate(
      z.object({ success: z.boolean() }),
      response.data,
      'Push sync'
    );

    return { success: data.success };
  }

  /**
   * Статус синхронизации — для индикатора в UI.
   */
  static async getStatus(): Promise<z.infer<typeof SyncStatusSchema> | null> {
    const response = await axiosClient.get('/sync/status/');
    const result = safeValidate(SyncStatusSchema, response.data, 'Sync status');
    return result.success ? result.data : null;
  }
}
