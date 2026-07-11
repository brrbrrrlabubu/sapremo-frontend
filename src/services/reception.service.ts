import { z } from 'zod';
import { axiosClient } from '../api/axiosClient';
import { ReceptionSchema, OfflineReceptionSchema } from '../schemas/apiSchemas';
import type { Reception } from '../types/api.types';

export class ReceptionService {
  public static async createReception(reception: Omit<Reception, 'id'>): Promise<Reception> {
    const response = await axiosClient.post('/reception/', reception);
    return ReceptionSchema.parse(response.data);
  }

  public static async syncOfflineReception(data: z.infer<typeof OfflineReceptionSchema>): Promise<{ success: boolean }> {
    // Валидация структуры перед отправкой на бэк во избежание отправки некорректных офлайн-логов
    OfflineReceptionSchema.parse(data);
    const response = await axiosClient.post('/reception/offline', data);
    const parsed = z.object({ success: z.boolean().catch(true) }).parse(response.data);
    return { success: parsed.success ?? true };
  }

  public static async acceptPartial(itemId: string, actualQty: number): Promise<{ success: boolean }> {
    const response = await axiosClient.post(`/reception/${itemId}/accept-partial`, {
      id: itemId,
      actual_qty: actualQty,
    });
    const parsed = z.object({ success: z.boolean().catch(true) }).parse(response.data);
    return { success: parsed.success ?? true };
  }
}
