import { useUserStore } from '../store/useUserStore';

export const useAccess = () => {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  const role = user?.role;

  // Определяем роли
  const isAdmin = role === 'admin';
  const isFactory = role === 'factory';
  const isAccountant = role === 'accountant';
  const isManager = role === 'manager';

  return {
    user,
    role,
    isAuthenticated,
    isAdmin,
    isFactory,
    isAccountant,
    isManager,
    isLoading: isAuthenticated && !user,
    
    // Группируем права:
    canManageWarehouse: isAdmin || isManager,
    canCreateReception: !isFactory,
  };
};