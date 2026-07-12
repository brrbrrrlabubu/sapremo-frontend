import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Form, Input, Button, Typography, App, Select } from "antd";
import { LockOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";
import { useUserStore } from "../store/useUserStore";
import { AuthService } from "../services/auth.service";

const { Title } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const { setUser, syncAuthFromStorage } = useUserStore();

  // Возвращаемся на страницу, с которой пользователь был перенаправлен на логин
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // Реальный API-вызов: токены сохраняются в localStorage внутри AuthService.login()
      const loginData = await AuthService.login(values.username, values.password);

      // Синхронизируем Zustand-стор с обновлённым токеном
      syncAuthFromStorage();

      // Сохраняем профиль пользователя из ответа API
      setUser({
        id: loginData.user.id,
        name: loginData.user.full_name || loginData.user.username,
        role: loginData.user.role as any,
      });

      message.success("Добро пожаловать в SAPREMO!");
      navigate(from, { replace: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Ошибка авторизации. Проверьте учётные данные.';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" }}>
      <Card style={{ width: 350, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Title level={3} style={{ textAlign: "center" }}>SAPREMO</Title>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: "Введите логин!" }]}>
            <Input prefix={<UserOutlined />} placeholder="Логин" />
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