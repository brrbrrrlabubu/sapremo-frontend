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
      {
        element: <ProtectedRoute allowedRoles={["admin", "manager", "factory", "accountant"]} />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "shipments", element: <ShipmentsPage /> },
          { path: "warehouses", element: <WarehousePage /> },
          { path: "finance", element: <FinancePage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "inventory", element: <InventoryPage /> },
          { path: "requests", element: <WarehouseRequestsPage /> },
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