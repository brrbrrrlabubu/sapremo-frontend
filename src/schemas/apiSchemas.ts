import { z } from 'zod';

// ─── Схемы авторизации ──────────────────────────────────────────────────────
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

// ─── Схемы товаров (Product) ────────────────────────────────────────────────
export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  barcode: z.string(),
  name: z.string(),
  pieces_per_box: z.number().int().nonnegative(),
  expiry_date: z.string(),
  batch_number: z.string(),
  factory_price: z.string(),
  dispatch_price: z.string(),
  status: z.string(), // API returns string, not enum
});

// ─── Схемы отгрузок (Shipment) ──────────────────────────────────────────────
export const ShipmentItemSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().optional(),
  qty_boxes: z.number().int().nonnegative(),
  qty_pieces: z.number().int().nonnegative(),
  price: z.string().optional(),
  total: z.string().optional(),
});

export const ShipmentSchema = z.object({
  id: z.string().uuid().optional(),
  items: z.array(ShipmentItemSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  warehouse_id: z.string().uuid(),
  shipment_date: z.string(),
  truck_number: z.string(),
  truck_driver: z.string(),
  status: z.string(), // API: enum ['pending','shipped','cancelled'] but returned as string
  total_amount: z.string().optional(),
  created_by: z.string().uuid(),
});

export const ShipmentStatusUpdateSchema = z.object({
  status: z.string(),
});

// ─── Схемы приёмки (FactoryDelivery / Reception) ────────────────────────────
export const DeliveryItemSchema = z.object({
  id: z.string().uuid().optional(),
  delivery_id: z.string().optional(),
  product_id: z.string().optional(),
  product_name: z.string().optional(),
  product_barcode: z.string().optional(),
  expected_qty: z.number().int().nonnegative(),
  actual_qty: z.number().int().nonnegative().nullable().optional(),
  discrepancy_type: z.string().optional(),
  discrepancy_type_display: z.string().optional(),
  discrepancy_qty: z.number().int().optional(),
  created_at: z.string().optional(),
});

export const ReceptionSchema = z.object({
  id: z.string().uuid().optional(),
  shipment_id: z.string().optional(),
  shipment_number: z.string().optional(),
  warehouse_id: z.string().uuid(),
  warehouse_name: z.string().optional(),
  delivery_number: z.string(),
  delivered_at: z.string(),
  status: z.string(), // API: enum ['pending','arrived','partial','completed']
  status_display: z.string().optional(),
  total_amount: z.string().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  items: z.array(DeliveryItemSchema).optional(),
});

// Offline reception (camelCase — совпадает с API)
export const ReceptionItemSchema = z.object({
  barcode: z.string(),
  actualQty: z.number().int().nonnegative(),
  factoryPrice: z.string(),
});

export const OfflineReceptionSchema = z.object({
  warehouseId: z.string().uuid(),
  createdAt: z.string(),
  clientId: z.string().uuid(),
  items: z.array(ReceptionItemSchema),
});

export const AcceptPartialItemSchema = z.object({
  id: z.string().uuid(),
  actual_qty: z.number().int().nonnegative(),
});

// ─── Схемы оплат (FactoryPayment) ───────────────────────────────────────────
export const PaymentSchema = z.object({
  id: z.string().uuid().optional(),
  updated_at: z.string().optional(),
  warehouse_id: z.string().uuid(),
  amount: z.string(),
  payment_method: z.string().optional(),
  comment: z.string().nullable().optional(),
  paid_at: z.string(),
  client_id: z.string(),
  operation_time: z.string(),
  created_at: z.string().optional(),
  created_by: z.string().uuid().optional(),
});

// ─── Схемы долгов (WarehouseDebt) ───────────────────────────────────────────
export const DebtSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  warehouse_id: z.string().uuid(),
  amount: z.string().optional(),
});

// ─── Схемы накладных (Invoice) ──────────────────────────────────────────────
export const InvoiceItemSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
  qty: z.number().int().optional(),
  price: z.string().optional(),
  total: z.string().optional(),
});

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  dispatch_id: z.string().uuid().optional(),
  driver_id: z.string().uuid().optional(),
  warehouse_id: z.string().uuid().optional(),
  total_amount: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  items: z.array(InvoiceItemSchema).optional(),
});

// ─── Схемы заявок от складов (WarehouseOrder) ───────────────────────────────
export const WarehouseOrderItemSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().optional(),
  productId: z.string().optional(), // API возвращает оба варианта
  qty: z.number().int().optional(),
  created_at: z.string().optional(),
});

export const WarehouseOrderSchema = z.object({
  id: z.string().uuid().optional(),
  warehouse_id: z.string().uuid().optional(),
  status: z.string().optional(),
  comment: z.string().optional(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  items: z.array(WarehouseOrderItemSchema).optional(),
});

export const WarehouseOrderStatusUpdateSchema = z.object({
  status: z.string(),
});

// ─── Схемы синхронизации ────────────────────────────────────────────────────
export const SyncStatusSchema = z.object({
  status: z.string(),
  last_sync: z.string().optional(),
  server_time: z.string().optional(),
});
