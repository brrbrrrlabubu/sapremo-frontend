import { Layout, Menu, Grid } from "antd";
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
import { useTranslation } from "react-i18next";
import { useState } from "react";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function MainLayout() {
  const [isOnline, setIsOnline] = useState<boolean>(true); 
  const location = useLocation();
  const { theme } = useUIStore();
  const { t } = useTranslation();
  const screens = useBreakpoint();

  const isDark = theme === "dark";
  const isMobile = !screens.md; // < 768px

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Боковое меню завода */}
      <Sider breakpoint="lg" collapsedWidth="0" style={{ background: "#001529" }}>
        <div style={{ height: 32, margin: "16px", background: "rgba(255, 255, 255, 0.2)", borderRadius: 4, textAlign: "center", color: "#ffffff", lineHeight: "32px", fontWeight: "bold", fontSize: "14px", letterSpacing: "1px" }}>
          {t('common.sapremoFactory')}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ background: "transparent" }}
          items={[
            { key: "/", icon: <DashboardOutlined />, label: <Link to="/">{t('menu.home')}</Link> },
            { key: "/requests", icon: <FileTextOutlined />, label: <Link to="/requests">{t('menu.warehouseRequests')}</Link> },
            { key: "/shipments", icon: <ShoppingCartOutlined />, label: <Link to="/shipments">{t('menu.shipments')}</Link> },
            { key: "/warehouses", icon: <DatabaseOutlined />, label: <Link to="/warehouses">{t('menu.warehouses')}</Link> },
            { key: "/finance", icon: <DollarOutlined />, label: <Link to="/finance">{t('menu.finance')}</Link> },
            { key: "/analytics", icon: <BarChartOutlined />, label: <Link to="/analytics">{t('menu.analytics')}</Link> },
            { key: "/reports", icon: <FileTextOutlined />, label: <Link to="/reports">{t('menu.reports')}</Link> },
          ]}
        />
      </Sider>
      
      {/* Основной контент */}
      <Layout>
        <Header style={{ 
          background: isDark ? "#141414" : "#ffffff", 
          padding: isMobile ? "0 8px 0 48px" : "0 24px", 
          display: "flex", 
          justifyContent: "flex-end", 
          alignItems: "center", 
          height: "64px", 
          borderBottom: `1px solid ${isDark ? "#303030" : "#f0f0f0"}`, 
          transition: "all 0.3s",
          gap: isMobile ? "6px" : "16px",
          overflow: "hidden",
        }}>
          {/* Индикатор «В сети» — скрыт на мобильных */}
          {!isMobile && (
            <div onClick={() => setIsOnline(!isOnline)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", background: isDark ? "#1f1f1f" : "#f5f5f5", padding: "6px 14px", borderRadius: "4px", border: `1px solid ${isDark ? "#303030" : "#e8e8e8"}`, userSelect: "none", transition: "all 0.3s" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isOnline ? "#4cd62b" : "#ff4d4f" }} />
              <span style={{ fontWeight: 500, fontSize: "14px", color: isDark ? "#ffffff" : "#000000" }}>
                {isOnline ? t('common.online') : t('common.offline')}
              </span>
            </div>
          )}
          {/* Селектор темы и языка */}
          <ThemeLangSelector compact={isMobile} />
        </Header>

        <Content style={{ 
          margin: isMobile ? "8px" : "24px 16px", 
          padding: isMobile ? 12 : 24, 
          background: isDark ? "#141414" : "#ffffff", 
          borderRadius: 8, 
          minHeight: 280, 
          transition: "all 0.3s" 
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}