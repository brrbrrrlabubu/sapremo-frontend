import { createBrowserRouter, RouterProvider  } from "react-router-dom";
import Mainlayout from "../layouts/Mainlayouts";
import DashboardPage from "../pages/DashboardPage";
import ShipmentsPage from "../pages/ShipmentPage";
import WavehousePage from "../pages/WarehousePage";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter( [
    {
         path: "/",
        element: <Mainlayout />, // наш главный каркас с сайдбаром
        children: [
          { 
           path: "/",
           element: <DashboardPage/>,
          },
          // Оборачиваем приватные страницы в ProtectedRoute
          {
           element: <ProtectedRoute allowedRoles={["admin", "manager"]} />,
           children: [
          {
           path: "/shipments",
           element: <ShipmentsPage/>,
          },
          { 
           path: "/warehouses",
           element: <WavehousePage/>
          },
        ],
      }, 
    ],
  },
  {
    path: "/login",
    element: <div>Страница авторизации(Скелет)</div>,
  },
]);

export default function AppRouter(){
    return<RouterProvider
    router={router}/>
}