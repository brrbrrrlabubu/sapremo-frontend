import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { UserRole } from "../types/enums";
import DashboardPage from "../pages/DashboardPage";
import WarehousePage from "../pages/WarehousePage";
import FinancePage from "../pages/FinancePage";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import ReportsPage from "../pages/ReportsPage";
import InventoryPage from "../pages/InventoryPage";
import WarehouseRequestsPage from "../pages/WarehouseRequestsPage";
import DriversPage from "../pages/DriversPage";
import DriverRequestsPage from "../pages/DriverRequestsPage";
import FactoryOperationsPage from "../pages/FactoryOperationsPage";
import ReceivingPage from "../pages/ReceivingPage";
import ShipmentsPage from "../pages/ShipmentPage";
import ReturnsPage from "../pages/ReturnsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Пути, доступные всем авторизованным (с разными уровнями доступа внутри)
      {
        element: <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Manager, UserRole.Factory, UserRole.Accountant]} />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "shipments", element: <ShipmentsPage /> },
          { path: "warehouses", element: <WarehousePage /> },
          { path: "inventory", element: <InventoryPage /> },
          { path: "requests", element: <WarehouseRequestsPage /> },
          { path: "driver-requests", element: <DriverRequestsPage /> },
          { path: "drivers", element: <DriversPage /> },
          { path: "receiving", element: <ReceivingPage /> },
          { path: "returns", element: <ReturnsPage /> },
        ],
      },
      // Пути для финансов и аналитики (Админ и Бухгалтер)
      {
        element: <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Accountant]} />,
        children: [
          { path: "finance", element: <FinancePage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "reports", element: <ReportsPage /> },
        ],
      },
      // Пути для производства (Админ и Фабрика)
      {
        element: <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Factory]} />,
        children: [
          { path: "factory", element: <FactoryOperationsPage /> },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
], {
  basename: import.meta.env.BASE_URL,
});

export default function AppRouter() {
  return <RouterProvider router={router} />;
}