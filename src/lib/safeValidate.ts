import { z } from 'zod';
import { notification } from 'antd';

// ─── Результат валидации ─────────────────────────────────────────────────────
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; data: null; errors: string[] };

/**
 * Валидирует данные через Zod-схему.
 * При ошибке — показывает Antd notification и возвращает { success: false }.
 * UI-компонент решает сам: показать fallback или продолжить с data.
 *
 * @param schema  — Zod-схема
 * @param raw     — Сырые данные с бэкенда
 * @param context — Метка для notification (например, 'Отгрузка #123')
 */
export function safeValidate<T extends z.ZodTypeAny>(
  schema: T,
  raw: unknown,
  context?: string
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(raw);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map(
    (e) => `${e.path.join('.')} — ${e.message}`
  );

  // Логируем полностью для дебага, уведомляем кратко для пользователя
  if (import.meta.env.DEV) {
    console.warn(
      `[safeValidate] Ошибка валидации${context ? ` (${context})` : ''}:`,
      result.error.format()
    );
  }

  notification.warning({
    message: 'Данные от сервера изменились',
    description: context
      ? `${context}: структура ответа не совпала с ожидаемой. Часть данных могла не загрузиться.`
      : 'Структура ответа сервера не совпала с ожидаемой. Обратитесь в поддержку, если проблема повторяется.',
    duration: 6,
    placement: 'topRight',
  });

  return { success: false, data: null, errors };
}

/**
 * "Строгая" версия — бросает ошибку вместо silent fallback.
 * Используй для критичных данных (токены авторизации, конфиги).
 */
export function strictValidate<T extends z.ZodTypeAny>(
  schema: T,
  raw: unknown,
  context?: string
): z.infer<T> {
  const result = schema.safeParse(raw);
  if (result.success) return result.data;

  const message = `[strictValidate] Критическая ошибка валидации${context ? ` (${context})` : ''}: ${result.error.message}`;
  console.error(message, result.error.format());
  throw new Error(message);
}

/**
 * Валидирует массив — фильтрует невалидные элементы, не роняет весь список.
 * Например: из 100 товаров 2 пришли с битым полем — покажем 98 рабочих.
 */
export function safeValidateArray<T extends z.ZodTypeAny>(
  schema: T,
  raw: unknown[],
  context?: string
): z.infer<T>[] {
  const valid: z.infer<T>[] = [];
  let invalidCount = 0;

  for (const item of raw) {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalidCount++;
      if (import.meta.env.DEV) {
        console.warn(`[safeValidateArray] Пропущен невалидный элемент:`, result.error.format());
      }
    }
  }

  if (invalidCount > 0) {
    notification.warning({
      message: 'Часть данных не загрузилась',
      description: `${context ? `${context}: ` : ''}${invalidCount} из ${raw.length} записей пришли с некорректной структурой и были пропущены.`,
      duration: 6,
      placement: 'topRight',
    });
  }

  return valid;
}
