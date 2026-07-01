import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message, Select } from "antd";
import { LockOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useUserStore } from "../store/useUserStore"; // Импорт твоего стора

const { Title } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore((state) => state.setUser); // Получаем функцию из стора

  const onFinish = (values: any) => {
    setLoading(true);
    
    // Имитация API ответа
    setTimeout(() => {
      // Сохраняем пользователя в Zustand
      setUser({
        id: "1",
        name: values.username,
        role: values.role // Роль теперь берется из формы
      });
      
      message.success("Добро пожаловать в SAPREMO!");
      navigate("/");
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" }}>
      <Card style={{ width: 350, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Title level={3} style={{ textAlign: "center" }}>SAPREMO</Title>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: "Введите логин!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Логин" />
          </Form.Item>
          
          {/* Добавляем выбор роли */}
          <Form.Item name="role" rules={[{ required: true, message: "Выберите роль!" }]}>
            <Select placeholder="Выберите роль" prefix={<TeamOutlined />}>
              <Select.Option value="admin">Администратор</Select.Option>
              <Select.Option value="factory">Завод</Select.Option>
              <Select.Option value="manager">Менеджер</Select.Option>
              <Select.Option value="accountant">Бухгалтер</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "Введите пароль!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>
          
          <Button type="primary" htmlType="submit" loading={loading} block>Войти</Button>
        </Form>
      </Card>
    </div>
  );
}