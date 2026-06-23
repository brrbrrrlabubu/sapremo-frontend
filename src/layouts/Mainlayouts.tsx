import { useState } from "react";
import { Layout, Menu } from "antd";
import { 
  DashboardOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined
} from "@ant-design/icons";
import { Outlet, Link, useLocation } from "react-router-dom";
// Импортируем современный плеер Lottie
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Импортируем твои файлы анимаций из папки assets
import onlineAnim from '../assets/online-status.json';
import offlineAnim from '../assets/offline-status.json';

const { Header, Sider, Content } = Layout;

export default function MainLayout() {
  const [isOnline, setIsOnline] = useState<boolean>(true); 
  const location = useLocation(); // Следим за текущим URL, чтобы меню подсвечивалось правильно

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Боковое меню (Сайдбар) */}
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ 
          height: 32, 
          margin: 15, 
          background: "rgba(255,255,255,0.2)", 
          borderRadius: 6, 
          textAlign: "center", 
          color: "#fff", 
          lineHeight: "32px", 
          fontWeight: "bold" 
        }}>
          SAPREMO ЗАВОД
        </div>
        
        <Menu 
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]} // Подсветка активного пункта по текущему пути
          items={[
            { 
              key: "/", 
              icon: <DashboardOutlined />, 
              label: <Link to="/">Главная (Dashboard)</Link> 
            },
            { 
              key: "/shipments", 
              icon: <ShoppingCartOutlined />, 
              label: <Link to="/shipments">Отгрузки товара</Link> 
            },
            { 
              key: "/warehouses", 
              icon: <DatabaseOutlined />, 
              label: <Link to="/warehouses">Управление складами</Link> 
            },
          ]}
        />
      </Sider>
      
      {/* Основная часть страницы */}
      <Layout>
        {/* Шапка (Верхняя панель) */}
        <Header style={{ background: "#fff", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: "bold" }}>Панель Управления</div>
          
          {/* Интерактивный статус Онлайн / Офлайн с Lottie */}
          <div 
            onClick={() => setIsOnline(!isOnline)} 
            style={{ 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: "6px",
              userSelect: "none"
            }}
          >
            <div style={{ width: 35, height: 35, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DotLottieReact 
                autoplay 
                loop 
                data={isOnline ? onlineAnim : offlineAnim} 
              />
            </div>
            <span style={{ 
              fontWeight: "bold", 
              transition: "color 0.3s",
              color: isOnline ? "#52c41a" : "#ff4d4f" 
            }}>
              {isOnline ? "Онлайн" : "Офлайн"}
            </span>
          </div>
        </Header>
        
        {/* Контентная область */}
        <Content style={{ margin: "24px 16px", padding: 24, background: "#fff", borderRadius: 6, minHeight: 280 }}>
          <p style={{ color: "#8c8c8c", fontSize: "12px", marginBottom: "20px" }}>
            Движок React Router + Lottie Animation активны
          </p>
          
          {/* Сюда роутер динамически подставляет нужную страницу (DashboardPage, ShipmentsPage или WarehousesPage) */}
          <Outlet />
          
        </Content>
      </Layout>
    </Layout>
  );
}