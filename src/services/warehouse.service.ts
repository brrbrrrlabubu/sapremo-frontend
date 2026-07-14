import { axiosClient } from '../api/axiosClient';
import { z } from 'zod';

// ─── Zod-схема для статистики склада ────────────────────────────────────────
export const WarehouseStatSchema = z.object({
  id: z.string().optional(),
  warehouse_id: z.string().optional(),
  warehouse_name: z.string().optional(),
  name: z.string().optional(),
  total_amount: z.string().optional(),
  count: z.number().optional(),
});

export type WarehouseStat = z.infer<typeof WarehouseStatSchema>;

// ─── Сервис складов ─────────────────────────────────────────────────────────
export class WarehouseService {
  /**
   * Нормализация ответа API: может быть массивом или объектом с полем `results`.
   * Централизованная нормализация вместо copy-paste в каждой странице.
   */
  private static normalizeList(raw: unknown): WarehouseStat[] {
    const arr = Array.isArray(raw)
      ? raw
      : (raw as Record<string, unknown>).results ?? [];
    return z.array(WarehouseStatSchema).parse(arr);
  }

  /** Получить статистику по всем складам */
  static async getStats(): Promise<WarehouseStat[]> {
    const { data } = await axiosClient.get('/stats/warehouses/');
    return this.normalizeList(data);
  }
}
