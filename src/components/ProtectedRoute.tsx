import { Navigate, Outlet } from "react-router-dom";
import { useUserStore } from "../store/useUserStore"; // Импортируем стор

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // Получаем пользователя из стора
  const user = useUserStore((state) => state.user);

  // 1. Если пользователя нет (null) - уводим на логин
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Если роль есть, но она не входит в разрешенный список - уводим на главную
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. Если всё ок - показываем страницу
  return <Outlet />;
}