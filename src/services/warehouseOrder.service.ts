import { axiosClient } from '../api/axiosClient';
import { WarehouseOrderSchema, WarehouseOrderStatusUpdateSchema } from '../schemas/apiSchemas';
import type { WarehouseOrder, WarehouseOrderStatusUpdate, PaginatedResponse } from '../types/api.types';
import { z } from 'zod';

export class WarehouseOrderService {
  public static async getOrders(page = 1, pageSize = 20): Promise<PaginatedResponse<WarehouseOrder>> {
    const response = await axiosClient.get('/warehouse-orders/', {
      params: { page, page_size: pageSize },
    });

    const paginatedOrders = z.object({
      count: z.number(),
      next: z.string().nullable(),
      previous: z.string().nullable(),
      results: z.array(WarehouseOrderSchema),
    });

    return paginatedOrders.parse(response.data) as PaginatedResponse<WarehouseOrder>;
  }

  public static async getOrder(id: string): Promise<WarehouseOrder> {
    const response = await axiosClient.get(`/warehouse-orders/${id}/`);
    return WarehouseOrderSchema.parse(response.data);
  }

  public static async createOrder(data: Record<string, unknown>): Promise<WarehouseOrder> {
    const response = await axiosClient.post('/warehouse-orders/', data);
    return WarehouseOrderSchema.parse(response.data);
  }

  // API: PUT /warehouse-orders/{id}/status — returns WarehouseOrderStatusUpdate
  public static async updateStatus(id: string, status: string): Promise<WarehouseOrderStatusUpdate> {
    const response = await axiosClient.put(`/warehouse-orders/${id}/status`, { status });
    return WarehouseOrderStatusUpdateSchema.parse(response.data);
  }
}
