import { axiosClient } from '../api/axiosClient';
import { ShipmentSchema } from '../schemas/apiSchemas';
import type { Shipment, ShipmentStatus } from '../types/api.types';

export class ShipmentService {
  public static async createShipment(shipment: Omit<Shipment, 'id'>): Promise<Shipment> {
    const response = await axiosClient.post('/shipments/', shipment);
    return ShipmentSchema.parse(response.data);
  }

  public static async updateStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    const response = await axiosClient.patch(`/shipments/${id}/status`, { status });
    return ShipmentSchema.parse(response.data);
  }
}
