import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Form, Input, Button, Typography, App } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useUserStore } from "../store/useUserStore";
import { AuthService } from "../services/auth.service";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const { setUser, syncAuthFromStorage } = useUserStore();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // Вызываем логин без передачи роли
      const loginData = await AuthService.login(values.username, values.password);

      syncAuthFromStorage();

      setUser({
        id: loginData.user.id,
        name: loginData.user.full_name || loginData.user.username,
        role: loginData.user.role as any,
      });

      message.success(t('login.welcome', "Добро пожаловать в SAPREMO!"));
      navigate(from, { replace: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('login.error', 'Ошибка авторизации. Проверьте учётные данные.');
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
          <Form.Item name="username" rules={[{ required: true, message: t('login.enterUsername', "Введите логин!") }]}>
            <Input prefix={<UserOutlined />} placeholder={t('login.username', "Логин")} />
          </Form.Item>
          
          <Form.Item name="password" rules={[{ required: true, message: t('login.enterPassword', "Введите пароль!") }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('login.password', "Пароль")} />
          </Form.Item>
          
          <Button type="primary" htmlType="submit" loading={loading} block>
            {t('login.submit', "Войти")}
          </Button>
        </Form>
      </Card>
    </div>
  );
}