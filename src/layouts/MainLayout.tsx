import { Layout, Menu, Grid, Dropdown, Input } from "antd";
import { UserRole } from "../types/enums";
import { useTranslation } from 'react-i18next';
import {
  DashboardOutlined,
  ShoppingOutlined,
  CarOutlined,
  FileTextOutlined,
  ImportOutlined,
  ExportOutlined,
  WalletOutlined,
  UndoOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  ShopOutlined
} from "@ant-design/icons";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeLangSelector } from "../components/ThemeLangSelector";
import { useUserStore } from "../store/useUserStore";
import { useUIStore } from "../store/useUIStore";
import { AuthService } from "../services/auth.service";
import { setNavigate } from "../api/axiosClient";
import { setDriverNavigate } from "../api/driverAxiosClient";
import { PALETTE } from "../theme/tokens";
import { useState, useEffect } from "react";
import sapremoLogo from "../assets/sapremo.jpg";

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

export default function MainLayout() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();
  const { theme } = useUIStore();
  const screens = useBreakpoint();

  const isMobile = !screens.md; // < 768px

  useEffect(() => {
    setNavigate(navigate);
    setDriverNavigate(navigate);
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
      label: user?.name || 'User',
      disabled: true,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t('common.logout'),
      onClick: handleLogout,
      danger: true,
    }
  ];

  const r = user?.role;
  const isAdmin = r === UserRole.Admin;
  const isFactory = r === UserRole.Factory || isAdmin;
  const isManager = r === UserRole.Manager || isAdmin;
  const isAccountant = r === UserRole.Accountant || isAdmin;

  const menuItems = [
    { key: "/", icon: <DashboardOutlined />, label: <Link to="/">{t('menu.dashboard')}</Link> },
    ...(isManager ? [{ key: "/warehouses", icon: <ShoppingOutlined />, label: <Link to="/warehouses">{t('menu.products')}</Link> }] : []),
    ...(isManager ? [{ key: "/drivers", icon: <CarOutlined />, label: <Link to="/drivers">{t('menu.drivers')}</Link> }] : []),
    ...(isManager ? [{ key: "/driver-requests", icon: <FileTextOutlined />, label: <Link to="/driver-requests">{t('menu.driverRequests')}</Link> }] : []),
    ...(isManager ? [{ key: "/requests", icon: <FileTextOutlined />, label: <Link to="/requests">{t('menu.requests')}</Link> }] : []),
    ...(isFactory ? [{ key: "/factory", icon: <ShopOutlined />, label: <Link to="/factory">{t('menu.factory', 'Склад')}</Link> }] : []),
    ...(isManager ? [{ key: "/receiving", icon: <ImportOutlined />, label: <Link to="/receiving">{t('menu.receiving')}</Link> }] : []),
    ...(isManager ? [{ key: "/shipments", icon: <ExportOutlined />, label: <Link to="/shipments">{t('menu.shipments')}</Link> }] : []),
    ...(isManager ? [{ key: "/returns", icon: <UndoOutlined />, label: <Link to="/returns">{t('menu.returns')}</Link> }] : []),
    ...(isFactory || isAccountant || isManager ? [{ key: "/finance", icon: <WalletOutlined />, label: <Link to="/finance">{t('menu.finance')}</Link> }] : []),
    ...(isManager || isAccountant ? [{ key: "/reports", icon: <BarChartOutlined />, label: <Link to="/reports">{t('menu.reports')}</Link> }] : []),
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Боковое меню */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={240}
        style={{
          background: "var(--color-bg-container, #ffffff)",
          borderRight: "1px solid var(--color-border, #f0f0f0)"
        }}
        theme={theme === 'dark' ? 'dark' : 'light'}
      >
        <div style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: "12px"
        }}>
          {/* Имитация логотипа из Figma */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={sapremoLogo} alt="Sapremo Logo" style={{ height: 32, width: 32, objectFit: 'cover', borderRadius: 4 }} />
            <span style={{ color: PALETTE.primary, fontWeight: 700, fontSize: "20px", letterSpacing: "0.5px" }}>Sapremo</span>
          </div>
        </div>
        <Menu
          theme={theme === 'dark' ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 0, padding: "8px", background: 'transparent' }}
          items={menuItems.map(item => ({
            ...item,
            style: location.pathname === item.key ? {
              backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : '#e6f4ff',
              color: 'var(--color-primary, #1890ff)',
              borderRadius: '6px',
              fontWeight: 500
            } : {
              borderRadius: '6px',
              color: 'var(--color-text-secondary, #595959)'
            }
          }))}
        />
      </Sider>

      {/* Основной контент */}
      <Layout>
        <Header style={{
          background: "var(--color-bg-container, #ffffff)",
          padding: isMobile ? "0 16px" : "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "64px",
          borderBottom: `1px solid var(--color-border, #f0f0f0)`,
        }}>
          {/* Индикатор статуса (слева) */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              onClick={() => setIsOnline(!isOnline)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: isOnline ? "#73D13D33" : "#ff4d4f33",
                padding: "4px 10px",
                height: "28px",
                borderRadius: "9999px",
                userSelect: "none",
                transition: "all 0.3s"
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "9999px", backgroundColor: isOnline ? "#389E0D" : "#cf1322" }} />
              <span style={{
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: "20px",
                color: isOnline ? "#389E0D" : "#cf1322"
              }}>
                {isOnline ? t('common.online') : t('common.offline')}
              </span>
            </div>
          </div>

          {/* Правая часть: Поиск, Тема и Профиль */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {!isMobile && (
              <Input
                placeholder={t('common.search')}
                prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                style={{ width: 240, borderRadius: "6px" }}
              />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ThemeLangSelector compact={isMobile} />
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--color-border, #d9d9d9)', background: 'var(--color-bg-elevated, #fafafa)' }}>
                  <UserOutlined style={{ color: 'var(--color-text-secondary, #595959)' }} />
                </div>
              </Dropdown>
            </div>
          </div>
        </Header>

        <Content style={{
          margin: 0,
          padding: isMobile ? 12 : 24,
          background: "var(--color-bg-layout, #f4f6f8)", // Using theme variable
          minHeight: 280,
        }}>
          <Outlet />
        </Content>

        <Footer style={{
          textAlign: 'left',
          background: 'var(--color-bg-container, #ffffff)',
          borderTop: '1px solid var(--color-border, #f0f0f0)',
          padding: '16px 24px',
          fontWeight: 600,
          color: 'var(--color-text-primary, #262626)',
          fontSize: '12px'
        }}>
          © 2026 Sapremo
        </Footer>
      </Layout>
    </Layout>
  );
}