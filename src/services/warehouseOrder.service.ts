import { axiosClient } from '../api/axiosClient';
import { WarehouseOrderSchema, WarehouseOrderStatusUpdateSchema } from '../schemas/apiSchemas';
import { safeValidate, safeValidateArray } from '../lib/safeValidate';
import type { WarehouseOrder, WarehouseOrderStatusUpdate, PaginatedResponse } from '../types/api.types';
import { z } from 'zod';

const PaginatedOrdersSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(z.unknown()),
});

export class WarehouseOrderService {
  public static async getOrders(
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<WarehouseOrder>> {
    const response = await axiosClient.get('/warehouse-orders/', {
      params: { page, page_size: pageSize },
    });

    const envelope = safeValidate(PaginatedOrdersSchema, response.data, 'Заявки склада');
    if (!envelope.success) {
      return { count: 0, next: null, previous: null, results: [] };
    }

    const validItems = safeValidateArray(
      WarehouseOrderSchema,
      envelope.data.results,
      'Заявки склада (список)'
    );

    return {
      count: envelope.data.count,
      next: envelope.data.next,
      previous: envelope.data.previous,
      results: validItems,
    };
  }

  public static async getOrder(id: string): Promise<WarehouseOrder | null> {
    const response = await axiosClient.get(`/warehouse-orders/${id}/`);
    const result = safeValidate(WarehouseOrderSchema, response.data, `Заявка ${id}`);
    return result.success ? result.data : null;
  }

  public static async createOrder(
    data: Record<string, unknown>
  ): Promise<WarehouseOrder | null> {
    const response = await axiosClient.post('/warehouse-orders/', data);
    const result = safeValidate(WarehouseOrderSchema, response.data, 'Создание заявки');
    return result.success ? result.data : null;
  }

  /** API: PUT /warehouse-orders/{id}/status */
  public static async updateStatus(
    id: string,
    status: string
  ): Promise<WarehouseOrderStatusUpdate | null> {
    const response = await axiosClient.put(`/warehouse-orders/${id}/status`, { status });
    const result = safeValidate(
      WarehouseOrderStatusUpdateSchema,
      response.data,
      `Статус заявки ${id}`
    );
    return result.success ? result.data : null;
  }

  /** PATCH /warehouse-orders/{orderId}/ — отмена заявки */
  public static async cancelOrder(orderId: string): Promise<void> {
    await axiosClient.patch(`/warehouse-orders/${orderId}/`, { status: 'cancelled' });
  }
}
