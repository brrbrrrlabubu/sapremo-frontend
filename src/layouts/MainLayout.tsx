import { Layout, Menu, Grid, Dropdown, Input, Button, Drawer } from "antd";
import { UserRole } from "../types/enums";
import { useTranslation } from 'react-i18next';
import {
  DashboardOutlined,
  ShoppingOutlined,
  CarOutlined,
  FileTextOutlined,
  WalletOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  ShopOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeLangSelector } from "../components/ThemeLangSelector";
import { useUserStore } from "../store/useUserStore";
import { useUIStore } from "../store/useUIStore";
import { AuthService } from "../services/auth.service";
import { setGlobalNavigate } from "../lib/tokenRefresh";
import { PALETTE } from "../theme/tokens";
import { useState, useEffect } from "react";
import sapremoLogo from "../assets/sapremo.jpg";

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

// ─── Содержимое навигационного меню ───────────────────────────────────────────
function SideNav({
  theme,
  location,
  menuItems,
  onSelect,
}: {
  theme: string;
  location: { pathname: string };
  menuItems: any[];
  onSelect?: () => void;
}) {
  return (
    <>
      {/* Логотип */}
      <div style={{
        height: 64,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: "12px",
        borderBottom: "1px solid var(--color-border, #f0f0f0)",
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={sapremoLogo}
            alt="Sapremo Logo"
            style={{ height: 32, width: 32, objectFit: 'cover', borderRadius: 4 }}
          />
          <span style={{ color: PALETTE.primary, fontWeight: 700, fontSize: "20px", letterSpacing: "0.5px" }}>
            Sapremo
          </span>
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
            fontWeight: 500,
          } : {
            borderRadius: '6px',
            color: 'var(--color-text-secondary, #595959)',
          },
        }))}
        onClick={onSelect}
      />
    </>
  );
}

export default function MainLayout() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  // На мобильном Drawer закрыт по умолчанию
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();
  const { theme } = useUIStore();
  const screens = useBreakpoint();

  const isMobile = !screens.md; // < 768px

  // Синхронизация реального состояния сети
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    setGlobalNavigate(navigate);
  }, [navigate]);

  // Закрывать Drawer при переходе на другую страницу
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      // Игнорируем сетевые ошибки при выходе
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
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: t('common.logout'),
      onClick: handleLogout,
      danger: true,
    },
  ];

  const r = user?.role;
  const isAdmin = r === UserRole.Admin;
  const isFactory = r === UserRole.Factory || isAdmin;
  const isManager = r === UserRole.Manager || isAdmin;
  const isAccountant = r === UserRole.Accountant || isAdmin;

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">{t('menu.dashboard')}</Link>,
    },
    ...(isManager ? [{
      key: "/warehouses",
      icon: <ShoppingOutlined />,
      label: <Link to="/warehouses">{t('menu.products')}</Link>,
    }] : []),
    ...(isManager ? [{
      key: "/drivers",
      icon: <CarOutlined />,
      label: <Link to="/drivers">{t('menu.drivers')}</Link>,
    }] : []),
    ...(isManager ? [{
      key: "/driver-requests",
      icon: <FileTextOutlined />,
      label: <Link to="/driver-requests">{t('menu.driverRequests')}</Link>,
    }] : []),
    ...(isManager ? [{
      key: "/requests",
      icon: <FileTextOutlined />,
      label: <Link to="/requests">{t('menu.requests')}</Link>,
    }] : []),
    ...(isFactory ? [{
      key: "/factory",
      icon: <ShopOutlined />,
      label: <Link to="/factory">{t('menu.factory')}</Link>,
    }] : []),
    ...(isFactory || isAccountant || isManager ? [{
      key: "/finance",
      icon: <WalletOutlined />,
      label: <Link to="/finance">{t('menu.finance')}</Link>,
    }] : []),
    ...(isManager || isAccountant ? [{
      key: "/reports",
      icon: <BarChartOutlined />,
      label: <Link to="/reports">{t('menu.reports')}</Link>,
    }] : []),
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>

      {/* ── Десктоп: обычный Sider ─────────────────────────────────────────── */}
      {!isMobile && (
        <Sider
          width={240}
          style={{
            background: "var(--color-bg-container, #ffffff)",
            borderRight: "1px solid var(--color-border, #f0f0f0)",
          }}
          theme={theme === 'dark' ? 'dark' : 'light'}
        >
          <SideNav theme={theme} location={location} menuItems={menuItems} />
        </Sider>
      )}

      {/* ── Мобильный: Drawer поверх контента ─────────────────────────────── */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={240}
          styles={{
            header: { display: 'none' },   // скрыть стандартный заголовок Drawer
            body: { padding: 0 },
          }}
          style={{
            background: "var(--color-bg-container, #ffffff)",
          }}
        >
          <SideNav
            theme={theme}
            location={location}
            menuItems={menuItems}
            onSelect={() => setDrawerOpen(false)}
          />
        </Drawer>
      )}

      {/* ── Основной контент ───────────────────────────────────────────────── */}
      <Layout>
        <Header style={{
          background: "var(--color-bg-container, #ffffff)",
          padding: isMobile ? "0 16px" : "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "64px",
          borderBottom: `1px solid var(--color-border, #f0f0f0)`,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          {/* Левая часть: бургер (только мобильный) + бейдж онлайн */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: 18 }} />}
                onClick={() => setDrawerOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  padding: 0,
                  borderRadius: 8,
                  color: 'var(--color-text-secondary, #595959)',
                }}
                aria-label="Open navigation"
              />
            )}

            {/* Бейдж «Система онлайн / оффлайн» */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: isOnline ? "#73D13D33" : "#ff4d4f33",
              padding: "4px 10px",
              height: "28px",
              borderRadius: "9999px",
              userSelect: "none",
              transition: "background 0.3s",
            }}>
              <span style={{
                width: "8px",
                height: "8px",
                borderRadius: "9999px",
                backgroundColor: isOnline ? "#389E0D" : "#cf1322",
                flexShrink: 0,
              }} />
              <span style={{
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: "20px",
                color: isOnline ? "#389E0D" : "#cf1322",
                whiteSpace: "nowrap",
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
                <div style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1px solid var(--color-border, #d9d9d9)',
                  background: 'var(--color-bg-elevated, #fafafa)',
                }}>
                  <UserOutlined style={{ color: 'var(--color-text-secondary, #595959)' }} />
                </div>
              </Dropdown>
            </div>
          </div>
        </Header>

        <Content style={{
          margin: 0,
          padding: isMobile ? 12 : 24,
          background: "var(--color-bg-layout, #f4f6f8)",
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
          fontSize: '12px',
        }}>
          © 2026 Sapremo
        </Footer>
      </Layout>
    </Layout>
  );
}