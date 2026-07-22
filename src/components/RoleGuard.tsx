// src/components/RoleGuard.tsx
import React from 'react';
import { useUserStore } from '../store/useUserStore';
import type { UserRole } from '../types/enums'; // Импортируем тип UserRole из types/enums

interface RoleGuardProps {
  allowedRoles: readonly UserRole[]; 
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const user = useUserStore((state) => state.user);

  // Если пользователя нет или роль не входит в список разрешенных — скрываем
  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return null;
  }

  return <>{children}</>;
};