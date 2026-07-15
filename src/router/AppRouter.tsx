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
import WarehouseRequestsPage from "../pages/WarehouseRequestsPage";
import DriversPage from "../pages/DriversPage";
import DriverRequestsPage from "../pages/DriverRequestsPage";
import FactoryOperationsPage from "../pages/FactoryOperationsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Manager, UserRole.Factory, UserRole.Accountant]} />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/requests", element: <WarehouseRequestsPage /> },
          { path: "/driver-requests", element: <DriverRequestsPage /> },
          { path: "/warehouses", element: <WarehousePage /> },
          { path: "/finance", element: <FinancePage /> },
          { path: "/analytics", element: <AnalyticsPage /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/drivers", element: <DriversPage /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[UserRole.Admin, UserRole.Factory]} />,
        children: [
          { path: "/factory", element: <FactoryOperationsPage /> },
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