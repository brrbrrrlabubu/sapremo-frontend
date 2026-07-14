export const UserRole = {
  Admin: 'admin',
  Manager: 'manager',
  Factory: 'factory',
  Accountant: 'accountant',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ShipmentStatus = {
  Pending: 'pending',
  Shipped: 'shipped',
  Cancelled: 'cancelled',
} as const;

export type ShipmentStatus = (typeof ShipmentStatus)[keyof typeof ShipmentStatus];
