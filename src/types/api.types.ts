import { z } from 'zod';
import { 
  LoginResponseSchema, 
  ProductSchema, 
  ShipmentSchema, 
  ReceptionSchema, 
  PaymentSchema, 
  InvoiceSchema 
} from '../schemas/apiSchemas';

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Shipment = z.infer<typeof ShipmentSchema>;
export type Reception = z.infer<typeof ReceptionSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ProductStatus = 'active' | 'inactive';
export type ShipmentStatus = 'pending' | 'shipped' | 'cancelled';
export type ReceptionStatus = 'pending' | 'arrived' | 'partial' | 'completed';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer';

export interface OfflineQueueItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: Record<string, unknown>;
  timestamp: string;
}
