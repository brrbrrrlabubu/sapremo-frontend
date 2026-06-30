import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    // Имитация входа (MVP)
    setTimeout(() => {
      console.log("Вход выполнен:", values);
      localStorage.setItem("isAuth", "true"); // Запоминаем, что юзер зашел
      message.success("Добро пожаловать в SAPREMO!");
      navigate("/"); // Перекидываем на главную
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
          <Form.Item name="password" rules={[{ required: true, message: "Введите пароль!" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Войти</Button>
        </Form>
      </Card>
    </div>
  );
}