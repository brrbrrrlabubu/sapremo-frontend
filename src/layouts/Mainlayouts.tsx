import { useState } from "react";
import { Layout, Menu, Space } from "antd";
import { 
  DashboardOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  DollarOutlined,
  BarChartOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ThemeLangSelector } from "../components/ThemeLangSelector";
import { useUIStore } from "../store/useUIStore";

const { Header, Sider, Content } = Layout;

export default function MainLayout() {
  const [isOnline, setIsOnline] = useState<boolean>(true); 
  const location = useLocation();
  const { theme } = useUIStore();

  const isDark = theme === "dark";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Боковое меню завода */}
      <Sider breakpoint="lg" collapsedWidth="0" style={{ background: "#001529" }}>
        <div style={{ height: 32, margin: "16px", background: "rgba(255, 255, 255, 0.2)", borderRadius: 4, textAlign: "center", color: "#ffffff", lineHeight: "32px", fontWeight: "bold", fontSize: "14px", letterSpacing: "1px" }}>
          SAPREMO ЗАВОД
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ background: "transparent" }}
          items={[
            { key: "/", icon: <DashboardOutlined />, label: <Link to="/">Главная</Link> },
            { key: "/shipments", icon: <ShoppingCartOutlined />, label: <Link to="/shipments">Отгрузки товара</Link> },
            { key: "/warehouses", icon: <DatabaseOutlined />, label: <Link to="/warehouses">Управление складами</Link> },
            { key: "/finance", icon: <DollarOutlined />, label: <Link to="/finance">Финансовый учет</Link> },
            { key: "/analytics", icon: <BarChartOutlined />, label: <Link to="/analytics">Аналитика</Link> },
            { key: "/reports", icon: <FileTextOutlined />, label: <Link to="/reports">Отчеты</Link> },
          ]}
        />
      </Sider>
      
      {/* Основной контент */}
      <Layout>
        <Header style={{ background: isDark ? "#141414" : "#ffffff", padding: "0 24px", display: "flex", justifyContent: "flex-end", alignItems: "center", height: "64px", borderBottom: `1px solid ${isDark ? "#303030" : "#f0f0f0"}`, transition: "all 0.3s" }}>
          <Space size="large">
            <div onClick={() => setIsOnline(!isOnline)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", background: isDark ? "#1f1f1f" : "#f5f5f5", padding: "6px 14px", borderRadius: "4px", border: `1px solid ${isDark ? "#303030" : "#e8e8e8"}`, userSelect: "none", transition: "all 0.3s" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isOnline ? "#4cd62b" : "#ff4d4f" }} />
              <span style={{ fontWeight: 500, fontSize: "14px", color: isDark ? "#ffffff" : "#000000" }}>
                {isOnline ? "В сети" : "Не в сети"}
              </span>
            </div>
            {/* Селектор аккуратно сидит в шапке */}
            <ThemeLangSelector />
          </Space>
        </Header>

        <Content style={{ margin: "24px 16px", padding: 24, background: isDark ? "#141414" : "#ffffff", borderRadius: 8, minHeight: 280, transition: "all 0.3s" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}