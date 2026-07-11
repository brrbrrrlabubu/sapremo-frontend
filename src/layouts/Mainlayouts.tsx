import { useState } from "react";
import { Layout, Menu, theme as antTheme } from "antd"; // Переименовали импорт theme в antTheme
import { 
  DashboardOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  DollarOutlined,
  InboxOutlined,
  BarChartOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ThemeLangSelector } from "../components/ThemeLangSelector";

const { Header, Sider, Content } = Layout;

export default function MainLayout() {
  const { token } = antTheme.useToken(); // Используем antTheme
  
  const [isOnline, setIsOnline] = useState<boolean>(true); 
  const location = useLocation();
  
  // Переименуем переменную из стора, чтобы не конфликтовала


  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider 
        breakpoint="lg" 
        collapsedWidth="0" 
        style={{ background: "#001529" }}
      >
        <div style={{ height: 32, margin: "16px", color: '#fff', textAlign: "center", fontWeight: "bold", lineHeight: "32px" }}>
          SAPREMO ЗАВОД
        </div>
        
        <Menu 
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]} 
          items={[
            { key: "/", icon: <DashboardOutlined />, label: <Link to="/">Главная</Link> },
            { key: "/shipments", icon: <ShoppingCartOutlined />, label: <Link to="/shipments">Отгрузки товара</Link> },
            { key: "/warehouses", icon: <DatabaseOutlined />, label: <Link to="/warehouses">Управление складами</Link> },
            { key: "/inventory", icon: <InboxOutlined />, label: <Link to="/inventory">Товары</Link> },
            { key: "/finance", icon: <DollarOutlined />, label: <Link to="/finance">Финансовый учет</Link> },
            { key: "/analytics", icon: <BarChartOutlined />, label: <Link to="/analytics">Аналитика</Link> },
            { key: "/reports", icon: <FileTextOutlined />, label: <Link to="/reports">Отчеты</Link> },
            
          ]}
        />
      </Sider>
      
      {/* Основной контент */}
      <Layout>
        <Header style={{ 
          background: token.colorBgContainer,
          padding: "0 24px", 
          display: "flex", 
          justifyContent: "flex-end",
          alignItems: "center", 
          height: "64px",
          borderBottom: `1px solid ${token.colorBorder}`
        }}>
          <ThemeLangSelector />
          <div 
            onClick={() => setIsOnline(!isOnline)} 
            style={{ 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              userSelect: "none",
              padding: "4px 8px",
              borderRadius: "4px"
            }}
          >
            <span style={{ 
              width: "8px", 
              height: "8px", 
              borderRadius: "50%", 
              backgroundColor: isOnline ? "#4cd62b" : "#ff4d4f"  
            }} />
            <span style={{ 
              fontWeight: 500, 
              fontSize: "14px", 
              color: token.colorText 
            }}> 
              {isOnline ? "В сети" : "Не в сети"}
            </span>
          </div>
        </Header>
        
        <Content style={{ padding: "24px", minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}