import { Layout, Menu, Grid, Dropdown, Avatar } from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  DollarOutlined,
  BarChartOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeLangSelector } from "../components/ThemeLangSelector";
import { useUIStore } from "../store/useUIStore";
import { useUserStore } from "../store/useUserStore";
import { AuthService } from "../services/auth.service";
import { setNavigate } from "../api/axiosClient";
import { PALETTE, themed } from "../theme/tokens";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

export default function MainLayout() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useUIStore();
  const { user, clearUser } = useUserStore();
  const { t } = useTranslation();
  const screens = useBreakpoint();

  const isDark = theme === "dark";
  const tTheme = themed(isDark);
  const isMobile = !screens.md; // < 768px

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      clearUser();
      navigate('/login');
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: user?.name || t('common.user', 'User'),
      disabled: true,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t('common.logout', 'Log out'),
      onClick: handleLogout,
      danger: true,
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Боковое меню завода */}
      <Sider breakpoint="lg" collapsedWidth="0" style={{ background: tTheme.sidebarNav }}>
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
          background: tTheme.layout,
          padding: isMobile ? "0 8px 0 48px" : "0 24px",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          height: "64px",
          borderBottom: `1px solid ${tTheme.border}`,
          transition: "all 0.3s",
          gap: isMobile ? "6px" : "16px",
          overflow: "hidden",
        }}>
          {/* Индикатор «В сети» — скрыт на мобильных */}
          {!isMobile && (
            <div onClick={() => setIsOnline(!isOnline)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", background: tTheme.container, padding: "6px 14px", borderRadius: "4px", border: `1px solid ${tTheme.border}`, userSelect: "none", transition: "all 0.3s" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: isOnline ? PALETTE.success : PALETTE.error }} />
              <span style={{ fontWeight: 500, fontSize: "14px", color: tTheme.text }}>
                {isOnline ? t('common.online') : t('common.offline')}
              </span>
            </div>
          )}
          {/* Селектор темы и языка */}
          <ThemeLangSelector compact={isMobile} />

          {/* Профиль пользователя */}
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', borderRadius: '4px', background: tTheme.container, border: `1px solid ${tTheme.border}`, transition: "all 0.3s" }}>
              <Avatar icon={<UserOutlined />} size="small" />
              {!isMobile && <span style={{ color: tTheme.text, fontWeight: 500 }}>{user?.name || t('common.user', 'User')}</span>}
            </div>
          </Dropdown>
        </Header>

        <Content style={{
          margin: isMobile ? "8px" : "24px 16px",
          padding: isMobile ? 12 : 24,
          background: tTheme.layout,
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