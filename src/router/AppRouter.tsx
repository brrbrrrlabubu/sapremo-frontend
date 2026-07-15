import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { UserRole } from "../types/enums";
import DashboardPage from "../pages/DashboardPage";
import ShipmentsPage from "../pages/ShipmentPage";
import WarehousePage from "../pages/WarehousePage";
import FinancePage from "../pages/FinancePage";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import ReportsPage from "../pages/ReportsPage";
import WarehouseRequestsPage from "../pages/WarehouseRequestsPage";
import ReceivingPage from "../pages/ReceivingPage";
import DriversPage from "../pages/DriversPage";
import DriverRequestsPage from "../pages/DriverRequestsPage";
import ReturnsPage from "../pages/ReturnsPage";

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
          { path: "/receiving", element: <ReceivingPage /> },
          { path: "/returns", element: <ReturnsPage /> },
          { path: "/shipments", element: <ShipmentsPage /> },
          { path: "/warehouses", element: <WarehousePage /> },
          { path: "/finance", element: <FinancePage /> },
          { path: "/analytics", element: <AnalyticsPage /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/drivers", element: <DriversPage /> },
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