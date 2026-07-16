import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Form, Input, Button, Typography, App, Select } from "antd";
import { LockOutlined, UserOutlined, SolutionOutlined } from "@ant-design/icons";
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

  // Обновили типы значений формы
  const onFinish = async (values: { username: string; password: string; role: string }) => {
    setLoading(true);
    try {
      // Передаем роль в сервис
      const loginData = await AuthService.login(values.username, values.password, values.role);

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
          
          <Form.Item name="role" rules={[{ required: true, message: "Выберите роль!" }]}>
            <Select placeholder="Выберите роль" suffixIcon={<SolutionOutlined />}>
              <Select.Option value="admin">Админ</Select.Option>
              <Select.Option value="manager">Менеджер</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: t('login.enterPassword', "Введите пароль!") }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('login.password', "Пароль")} />
          </Form.Item>
          
          <Button type="primary" htmlType="submit" loading={loading} block>{t('login.submit', "Войти")}</Button>
        </Form>
      </Card>
    </div>
  );
}