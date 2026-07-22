export const UserRole = {
  Admin: 'admin',
  Manager: 'manager',
  Factory: 'factory',
  Accountant: 'accountant',
  WarehouseManager: 'warehouse_manager', // Добавлено для поддержки роли зав. склада
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ShipmentStatus = {
  Pending: 'pending',
  Shipped: 'shipped',
  Cancelled: 'cancelled',
} as const;

export type ShipmentStatus = (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

// Матрица разрешений (перенесена из roles.ts)
export const PERMISSIONS = {
  CAN_EXPORT_EXCEL: [UserRole.Admin, UserRole.Manager, UserRole.Accountant],
  CAN_VIEW_FINANCE: [UserRole.Admin, UserRole.Accountant],
  CAN_MANAGE_SHIPMENTS: [UserRole.Admin, UserRole.Factory],
  CAN_VIEW_ANALYTICS: [UserRole.Admin, UserRole.Manager],
  CAN_MANAGE_WAREHOUSE: [UserRole.Admin, UserRole.Manager, UserRole.WarehouseManager],
} as const;