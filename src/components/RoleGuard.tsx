// src/components/RoleGuard.tsx
import React from 'react';
import { useUserStore } from '../store/useUserStore'; // Укажи свой путь
import type { UserRoleType } from '../config/roles';

interface RoleGuardProps {
  allowedRoles: readonly UserRoleType[]; 
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const user = useUserStore((state) => state.user);

  // Если пользователя нет или роль не совпадает — скрываем
  if (!user || !allowedRoles.includes(user.role as UserRoleType)) {
    return null;
  }

  return <>{children}</>;
};