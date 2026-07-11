// src/config/roles.ts
export const UserRole = {
  ADMIN: 'admin',
  FACTORY: 'factory',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const PERMISSIONS = {
  CAN_EXPORT_EXCEL: [UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT],
  CAN_VIEW_FINANCE: [UserRole.ADMIN, UserRole.ACCOUNTANT],
  CAN_MANAGE_SHIPMENTS: [UserRole.ADMIN, UserRole.FACTORY],
} as const;