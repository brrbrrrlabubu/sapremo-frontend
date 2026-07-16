import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Mainlayout from "../layouts/Mainlayouts";
import DashboardPage from "../pages/DashboardPage";
import ShipmentsPage from "../pages/ShipmentPage";
import WarehousePage from "../pages/WarehousePage";
import FinancePage from "../pages/FinancePage";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import ReportsPage from "../pages/ReportsPage";
import InventoryPage from "../pages/InventoryPage";
import WarehouseRequestsPage from "../pages/WarehouseRequestsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Mainlayout />,
    children: [
      // Пути, доступные всем авторизованным
      {
        element: <ProtectedRoute allowedRoles={["admin", "manager", "factory", "accountant"]} />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "shipments", element: <ShipmentsPage /> },
        ],
      },
      // Пути для склада и производства
      {
        element: <ProtectedRoute allowedRoles={["admin", "manager", "factory"]} />,
        children: [
          { path: "warehouses", element: <WarehousePage /> },
          { path: "inventory", element: <InventoryPage /> },
          { path: "requests", element: <WarehouseRequestsPage /> },
        ],
      },
      // Пути для финансов и аналитики (только админ и бухгалтер)
      {
        element: <ProtectedRoute allowedRoles={["admin", "accountant"]} />,
        children: [
          { path: "finance", element: <FinancePage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "reports", element: <ReportsPage /> },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
], {
  basename: "/sapremo-frontend",
});

export default function AppRouter() {
  return <RouterProvider router={router} />;
}