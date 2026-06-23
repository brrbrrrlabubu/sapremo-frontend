import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRoutePros {
    allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }:
    ProtectedRoutePros ) {
        // ВРЕМЕННАЯ ЗАГЛУШКА (Нурсултану)
        // Имитируем, что пользователь залогинен и у него роль 'admin' 
        const isAutheticated = true;
        const useRole = "admin";

        // Еслти пользователь вообще не авторизован -- Отправляем на логин
        if (!isAutheticated) {
            return <Navigate to="./login" replace />
        }

        // Если у сттаницы есть ограниценяи по ролям и роль юзера не подходит - уводим на глвную
        if(allowedRoles && !allowedRoles.includes(useRole)) {
            return <Navigate to="/" replace />;
        }
        // Если всё ок - рендерим дочерние страницы (маршруты)
        return <Outlet />
    }