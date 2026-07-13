import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Импортируем App вместо message
import { Card, Form, Input, Button, Typography, Select, App } from "antd"; 
import { LockOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useUserStore } from "../store/useUserStore"; 
import { useUIStore } from "../store/useUIStore"; 

const { Title } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser); 

  const { theme } = useUIStore();
  const isDark = theme === "dark";

  // Достаем умный message, знающий про нашу темную тему
  const { message } = App.useApp(); 

  const onFinish = (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      setUser({
        id: "1",
        name: values.username,
        role: values.role 
      });
      
      // Вызываем как обычно! Теперь плашка автоматически отрендерится в темном стиле
      message.success("Добро пожаловать в SAPREMO!"); 
      navigate("/");
      setLoading(false);
    }, 1000);
  };

  return (
    <div 
      style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh", 
        width: "100vw",
        background: isDark ? "#141414" : "#f0f2f5", 
        transition: "background 0.3s ease", 
        overflow: "hidden"
      }}
    >
      <Card 
        style={{ 
          width: 350, 
          boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.08)",
          background: isDark ? "#1f1f1f" : "#ffffff",
          border: `1px solid ${isDark ? "#303030" : "#e8e8e8"}`,
          transition: "background 0.3s ease, border-color 0.3s ease"
        }}
      >
        <Title level={3} style={{ textAlign: "center", margin: "0 0 24px 0", color: isDark ? "#ffffff" : "inherit" }}>
          SAPREMO
        </Title>
        
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: "Введите логин!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Логин" size="large" />
          </Form.Item>
          
          <Form.Item name="role" rules={[{ required: true, message: "Выберите роль!" }]}>
            <Select placeholder="Выберите роль" prefix={<TeamOutlined />} size="large">
              <Select.Option value="admin">Администратор</Select.Option>
              <Select.Option value="factory">Завод</Select.Option>
              <Select.Option value="manager">Менеджер</Select.Option>
              <Select.Option value="accountant">Бухгалтер</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Введите пароль!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" size="large" />
          </Form.Item>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading} 
            block 
            size="large"
            style={{ marginTop: 8, height: "40px" }}
          >
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
}