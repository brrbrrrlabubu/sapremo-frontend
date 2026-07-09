import { useState, useEffect } from "react";
import "./App.css";
import { ConfigProvider, theme, Layout } from "antd";
import AppRouter from "./router/AppRouter";
const { Content } = Layout;

export default function App() {
  const [ isDarkMode ] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.style.backgroundColor = isDarkMode ? "#141414" : "#f0f2f5";
  }, [isDarkMode]);

  return (
    <ConfigProvider 
      theme={{ 
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff", 
          colorText: isDarkMode ? "#ffffff" : "#000000",
        },
        components: {
          // ЦЕНТР УПРАВЛЕНИЯ ЦВЕТАМИ
          Menu: {
            darkItemBg: isDarkMode ? "#000c17": "#001529", 
            darkItemSelectedBg: "#1890ff",
            darkItemSelectedColor: "#ffffff",
          },
          Tabs: {
            itemColor: isDarkMode ? "#ffffff" : "#000000",
            itemSelectedColor: "#1890ff",
          },
          Skeleton: {
            color: isDarkMode ? "#333" : "#f2f2f2",
            colorGradientEnd: isDarkMode ? "#444" : "#e6e6e6",
          },
          FloatButton: {
            colorPrimary: isDarkMode ? "#002766" : "#1890ff",
            colorPrimaryHover: isDarkMode ? "#0050b3" : "#40a9ff",
          }
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
        <Content>
          <AppRouter />
        </Content>
      </Layout>
    </ConfigProvider>
  );
}