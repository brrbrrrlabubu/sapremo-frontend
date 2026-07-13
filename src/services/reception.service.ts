import { z } from 'zod';
import { axiosClient } from '../api/axiosClient';
import { ReceptionSchema, OfflineReceptionSchema, AcceptPartialItemSchema } from '../schemas/apiSchemas';
import type { Reception, PaginatedResponse } from '../types/api.types';

export class ReceptionService {
  public static async getReceptions(page = 1, pageSize = 20): Promise<PaginatedResponse<Reception>> {
    const response = await axiosClient.get('/reception/', {
      params: { page, page_size: pageSize },
    });

    const paginatedSchema = z.object({
      count: z.number(),
      next: z.string().nullable(),
      previous: z.string().nullable(),
      results: z.array(ReceptionSchema),
    });

    return paginatedSchema.parse(response.data) as PaginatedResponse<Reception>;
  }

  public static async getReception(id: string): Promise<Reception> {
    const response = await axiosClient.get(`/reception/${id}/`);
    return ReceptionSchema.parse(response.data);
  }

  public static async createReception(reception: {
    warehouse_id: string;
    delivery_number: string;
    delivered_at: string;
    status?: string;
    created_by: string;
  }): Promise<Reception> {
    const response = await axiosClient.post('/reception/', reception);
    return ReceptionSchema.parse(response.data);
  }

  public static async syncOfflineReception(data: z.infer<typeof OfflineReceptionSchema>): Promise<unknown> {
    OfflineReceptionSchema.parse(data);
    const response = await axiosClient.post('/reception/offline', data);
    return response.data;
  }

  // POST /reception/{id}/accept — full acceptance
  public static async acceptFull(id: string): Promise<void> {
    await axiosClient.post(`/reception/${id}/accept`);
  }

  // POST /reception/{id}/accept-partial
  public static async acceptPartial(id: string, itemId: string, actualQty: number): Promise<z.infer<typeof AcceptPartialItemSchema>> {
    const payload = { id: itemId, actual_qty: actualQty };
    AcceptPartialItemSchema.parse(payload);
    const response = await axiosClient.post(`/reception/${id}/accept-partial`, payload);
    return AcceptPartialItemSchema.parse(response.data);
  }
}
