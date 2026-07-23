import { axiosClient } from '../api/axiosClient';
import { ShipmentSchema, ShipmentStatusUpdateSchema } from '../schemas/apiSchemas';
import { safeValidate, safeValidateArray } from '../lib/safeValidate';
import type { Shipment, ShipmentStatusUpdate, PaginatedResponse } from '../types/api.types';
import { z } from 'zod';

const PaginatedShipmentsSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(z.unknown()),
});

export class ShipmentService {
  public static async getShipments(
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Shipment>> {
    const response = await axiosClient.get('/shipments/', {
      params: { page, page_size: pageSize },
    });

    const envelope = safeValidate(PaginatedShipmentsSchema, response.data, 'Список отгрузок');
    if (!envelope.success) {
      return { count: 0, next: null, previous: null, results: [] };
    }

    const validItems = safeValidateArray(
      ShipmentSchema,
      envelope.data.results,
      'Отгрузки (список)'
    );

    return {
      count: envelope.data.count,
      next: envelope.data.next,
      previous: envelope.data.previous,
      results: validItems,
    };
  }

  public static async getShipment(id: string): Promise<Shipment | null> {
    const response = await axiosClient.get(`/shipments/${id}/`);
    const result = safeValidate(ShipmentSchema, response.data, `Отгрузка ${id}`);
    return result.success ? result.data : null;
  }

  public static async createShipment(shipment: {
    warehouse_id: string;
    shipment_date: string;
    truck_number: string;
    truck_driver: string;
    status?: string;
    created_by: string;
  }): Promise<Shipment | null> {
    const response = await axiosClient.post('/shipments/', shipment);
    const result = safeValidate(ShipmentSchema, response.data, 'Создание отгрузки');
    return result.success ? result.data : null;
  }

  /** API: PUT /shipments/{id}/status */
  public static async updateStatus(
    id: string,
    status: string
  ): Promise<ShipmentStatusUpdate | null> {
    const response = await axiosClient.put(`/shipments/${id}/status`, { status });
    const result = safeValidate(
      ShipmentStatusUpdateSchema,
      response.data,
      `Статус отгрузки ${id}`
    );
    return result.success ? result.data : null;
  }

  /** PATCH /shipments/{id}/ — отмена отгрузки */
  public static async cancelShipment(id: string): Promise<void> {
    await axiosClient.patch(`/shipments/${id}/`, { status: 'cancelled' });
  }

  // Note: DELETE is NOT in the API spec
}
