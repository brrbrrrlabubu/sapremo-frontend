import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRoutePros {
    allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRoutePros) {
    // ВРЕМЕННАЯ ЗАГЛУШКА: имитируем, что пользователь залогинен
    const isAuthenticated = localStorage.getItem("isAuth") === "true"; 
    const userRole = "admin";

    // Если не авторизован - уводим на логин (без точки в пути)
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Если роль не подходит - уводим на главную
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    // Если всё ок - показываем страницу
    return <Outlet />;
}