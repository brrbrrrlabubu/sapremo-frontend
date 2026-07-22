import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { UserRole } from "../types/enums";
import DashboardPage from "../pages/DashboardPage";
import WarehousePage from "../pages/WarehousePage";
import FinancePage from "../pages/FinancePage";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import ReportsPage from "../pages/ReportsPage";
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
      {
        element: <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Manager, UserRole.Factory, UserRole.Accountant, UserRole.WarehouseManager]} />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "requests", element: <WarehouseRequestsPage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Manager, UserRole.Factory, UserRole.Accountant]} />,
        children: [
          { path: "shipments", element: <ShipmentsPage /> },
          { path: "warehouses", element: <WarehousePage /> },
          { path: "receiving", element: <ReceivingPage /> },
          { path: "returns", element: <ReturnsPage /> },
          { path: "drivers", element: <DriversPage /> },
          { path: "driver-requests", element: <DriverRequestsPage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Accountant, UserRole.Factory, UserRole.Manager]} />,
        children: [
          { path: "finance", element: <FinancePage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "reports", element: <ReportsPage /> },
        ],
      },
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
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
], {
  basename: import.meta.env.BASE_URL,
});

export default function AppRouter() {
  return <RouterProvider router={router} />;
}