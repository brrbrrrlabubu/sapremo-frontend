import { z } from 'zod';
import { 
  LoginResponseSchema, 
  ProductSchema, 
  ShipmentSchema,
  ShipmentItemSchema,
  ShipmentStatusUpdateSchema,
  ReceptionSchema, 
  DeliveryItemSchema,
  PaymentSchema, 
  DebtSchema,
  InvoiceSchema,
  InvoiceItemSchema,
  WarehouseOrderSchema,
  WarehouseOrderItemSchema,
  WarehouseOrderStatusUpdateSchema,
} from '../schemas/apiSchemas';

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Shipment = z.infer<typeof ShipmentSchema>;
export type ShipmentItem = z.infer<typeof ShipmentItemSchema>;
export type ShipmentStatusUpdate = z.infer<typeof ShipmentStatusUpdateSchema>;
export type Reception = z.infer<typeof ReceptionSchema>;
export type DeliveryItem = z.infer<typeof DeliveryItemSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Debt = z.infer<typeof DebtSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type WarehouseOrder = z.infer<typeof WarehouseOrderSchema>;
export type WarehouseOrderItem = z.infer<typeof WarehouseOrderItemSchema>;
export type WarehouseOrderStatusUpdate = z.infer<typeof WarehouseOrderStatusUpdateSchema>;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ShipmentStatus = 'pending' | 'shipped' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer';

export interface OfflineQueueItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: Record<string, unknown>;
  timestamp: string;
}
