import { z } from 'zod';

// Схемы авторизации
export const LoginResponseSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    role: z.string(),
    full_name: z.string().optional(),
  }),
});

// Схемы товаров
export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  barcode: z.string().min(1),
  name: z.string().min(1),
  pieces_per_box: z.number().int().positive(),
  expiry_date: z.string(), // Формат YYYY-MM-DD
  batch_number: z.string(),
  factory_price: z.string(), // Передается как string для точности с Decimal полей бэка
  dispatch_price: z.string(),
  status: z.enum(['active', 'inactive']),
});

// Схемы отгрузок
export const ShipmentSchema = z.object({
  id: z.string().uuid().optional(),
  warehouse_id: z.string().uuid(),
  shipment_date: z.string(),
  truck_number: z.string(),
  truck_driver: z.string(),
  status: z.enum(['pending', 'shipped', 'cancelled']),
  created_by: z.string().uuid(),
});

// Схемы приемки товара
export const ReceptionItemSchema = z.object({
  barcode: z.string(),
  actualQty: z.number().int().nonnegative(),
  factoryPrice: z.string(),
});

export const ReceptionSchema = z.object({
  id: z.string().uuid().optional(),
  warehouse_id: z.string().uuid(),
  delivery_number: z.string(),
  delivered_at: z.string(),
  status: z.enum(['pending', 'arrived', 'partial', 'completed']),
  created_by: z.string().uuid(),
});

export const OfflineReceptionSchema = z.object({
  warehouseId: z.string().uuid(),
  createdAt: z.string(),
  clientId: z.string(),
  items: z.array(ReceptionItemSchema),
});

// Схемы оплат
export const PaymentSchema = z.object({
  id: z.string().uuid().optional(),
  warehouse_id: z.string().uuid(),
  amount: z.string(),
  payment_method: z.enum(['cash', 'card', 'bank_transfer']),
  comment: z.string().catch(''),
  paid_at: z.string(),
  client_id: z.string(),
  operation_time: z.string(),
});

export const DebtSchema = z.object({
  warehouse_id: z.string().uuid(),
  warehouse_name: z.string(),
  total_debt: z.string(),
});

// Схемы накладных
export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  invoice_number: z.string(),
  amount: z.string(),
  created_at: z.string(),
  status: z.string(),
});

// Схемы синхронизации
export const SyncStatusSchema = z.object({
  status: z.string(),
  last_sync: z.string(),
  server_time: z.string(),
});
