import { axiosClient } from '../api/axiosClient';
import { ShipmentSchema, ShipmentStatusUpdateSchema } from '../schemas/apiSchemas';
import type { Shipment, ShipmentStatusUpdate, PaginatedResponse } from '../types/api.types';
import { z } from 'zod';

export class ShipmentService {
  public static async getShipments(page = 1, pageSize = 20): Promise<PaginatedResponse<Shipment>> {
    const response = await axiosClient.get('/shipments/', {
      params: { page, page_size: pageSize },
    });

    const paginatedSchema = z.object({
      count: z.number(),
      next: z.string().nullable(),
      previous: z.string().nullable(),
      results: z.array(ShipmentSchema),
    });

    return paginatedSchema.parse(response.data) as PaginatedResponse<Shipment>;
  }

  public static async getShipment(id: string): Promise<Shipment> {
    const response = await axiosClient.get(`/shipments/${id}/`);
    return ShipmentSchema.parse(response.data);
  }

  public static async createShipment(shipment: {
    warehouse_id: string;
    shipment_date: string;
    truck_number: string;
    truck_driver: string;
    status?: string;
    created_by: string;
  }): Promise<Shipment> {
    const response = await axiosClient.post('/shipments/', shipment);
    return ShipmentSchema.parse(response.data);
  }

  // API: PUT /shipments/{id}/status — returns ShipmentStatusUpdate, not full Shipment
  public static async updateStatus(id: string, status: string): Promise<ShipmentStatusUpdate> {
    const response = await axiosClient.put(`/shipments/${id}/status`, { status });
    return ShipmentStatusUpdateSchema.parse(response.data);
  }

  // Note: DELETE is NOT in the API spec — removed deleteShipment method
}
