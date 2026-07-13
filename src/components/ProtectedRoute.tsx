import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useUserStore();

  // 1. Если пользователь не авторизован (нет токена) — перенаправляем на логин,
  //    сохраняя текущий URL для корректного Redirect Back после успешного входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Если список ролей задан и роль пользователя не входит — на главную
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Доступ разрешён — рендерим дочерние маршруты
  return <Outlet />;
}