import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, Tabs, Tag, Typography, Space, Card, Row, Col, notification, Popconfirm, InputNumber } from "antd";
import { PlusOutlined, FileTextOutlined, CalendarOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { dataService } from "../services/dataService";
import type { Shipment } from "../services/dataService";
import { useUIStore } from "../store/useUIStore"; // Импортируем наш стор

const { Title, Text } = Typography;
const { Option } = Select;

export default function ShipmentsPage() {
  const currentUserRole = "admin"; 
  const canManage = currentUserRole === "admin" || currentUserRole === "manager";

  const { theme } = useUIStore();
  const isDark = theme === "dark";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>(dataService.getShipments());
  const [form] = Form.useForm();

  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setShipments(dataService.getShipments());
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = (values: any) => {
    const randomAmount = (values.quantity || 1) * 1000;
    const docNum = `НАК-00${Math.floor(100 + Math.random() * 900)}`;
    
    dataService.addShipment({
      docNumber: docNum,
      date: values.date.format("YYYY-MM-DD"),
      warehouse: values.warehouse,
      client: values.client,
      status: "transit", 
      comment: values.comment || "",
      amount: randomAmount
    });

    setIsModalOpen(false);
    form.resetFields();

    notification.success({
      message: "Накладная создана",
      description: `Документ ${docNum} отправлен в статусе "В пути".`,
    });
  };

  const handleChangeStatus = (id: string, newStatus: Shipment["status"], docNumber: string) => {
    dataService.updateStatus(id, newStatus);
    notification.success({
      message: "Статус изменен",
      description: `Накладная ${docNumber} обновлена.`,
    });
  };

  const handleDelete = (id: string, docNumber: string) => {
    dataService.deleteShipment(id);
    notification.warning({
      message: "Документ удален",
      description: `Накладная ${docNumber} удалена.`,
    });
  };

  const columns = [
    { 
      title: "№ Документа", 
      dataIndex: "docNumber", 
      key: "docNumber", 
      render: (text: string) => (
        <Space>
          <FileTextOutlined style={{ color: "#1890ff" }} />
          {/* Исправлено: цвет текста адаптируется к теме */}
          <strong style={{ color: isDark ? "rgba(255, 255, 255, 0.85)" : "#000000" }}>{text}</strong>
        </Space>
      ) 
    },
    { 
      title: "Дата", 
      dataIndex: "date", 
      key: "date", 
      render: (date: string) => (
        <Space style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "inherit" }}>
          <CalendarOutlined style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0,0,0,0.45)" }} />
          {date}
        </Space>
      ) 
    },
    { title: "Склад", dataIndex: "warehouse", key: "warehouse" },
    { 
      title: "Клиент", 
      dataIndex: "client", 
      key: "client", 
      render: (text: string) => (
        <Space style={{ color: isDark ? "rgba(255, 255, 255, 0.85)" : "inherit" }}>
          <UserOutlined />{text}
        </Space>
      ) 
    },
    { 
      title: "Сумма", 
      dataIndex: "amount", 
      key: "amount", 
      render: (amount: number) => (
        <Text strong style={{ color: isDark ? "rgba(255, 255, 255, 0.85)" : "#000000" }}>
          {amount?.toLocaleString()} сом
        </Text>
      ) 
    },
    { 
      title: "Статус", 
      dataIndex: "status", 
      key: "status", 
      render: (status: Shipment["status"]) => {
        // Мягкая палитра для статусов ТТН в темной и светлой темах
        const config: any = {
          shipped: { bg: isDark ? "#142518" : "#efffe2", text: isDark ? "#52c41a" : "#52C41A", icon: <CheckCircleOutlined />, label: "Принято" },
          transit: { bg: isDark ? "#2b2111" : "#fff6da", text: isDark ? "#faad14" : "#FAAD14", icon: <CloseCircleOutlined />, label: "В пути" },
          discrepancy: { bg: isDark ? "#2c1517" : "#ffdfde", text: isDark ? "#ff4d4f" : "#F5222D", icon: <CloseCircleOutlined />, label: "С расхождением" },
          defective: { bg: isDark ? "#2d1d11" : "#fff5e5", text: isDark ? "#fa8c16" : "#FA8C16", icon: <CloseCircleOutlined />, label: "Брак" },
        };
        const current = config[status];
        return <Tag style={{ backgroundColor: current.bg, color: current.text, borderColor: isDark ? "transparent" : undefined, borderRadius: "4px" }}>{current.icon} {current.label}</Tag>;
      }
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: Shipment) => (
        <Space size="small">
          <Button type="text" icon={<PrinterOutlined style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "inherit" }} />} onClick={() => {
            const win = window.open('', '_blank', 'width=800,height=600');
            if (win) {
              win.document.write(`<html><body><h1>Накладная ${record.docNumber}</h1><p>Склад: ${record.warehouse}</p><p>Сумма: ${record.amount} сом</p><script>window.onload = function() { window.print(); };</script></body></html>`);
              win.document.close();
            }
          }} />
          {record.status === "transit" && (
            <Button type="text" style={{ color: "#52c41a" }} icon={<CheckCircleOutlined />} disabled={!canManage} onClick={() => handleChangeStatus(record.id, "shipped", record.docNumber)}>Принять</Button>
          )}
          {record.status === "transit" && (
            <Button type="text" style={{ color: "#1890FF" }} icon={<CloseCircleOutlined />} disabled={!canManage} onClick={() => handleChangeStatus(record.id, "defective", record.docNumber)}>Брак</Button>
          )}
          <Popconfirm title="Удалить?" disabled={!canManage} onConfirm={() => handleDelete(record.id, record.docNumber)}>
            <Button type="text" danger icon={<DeleteOutlined />} disabled={!canManage} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderTable = (statusFilter?: string) => {
    const data = statusFilter ? shipments.filter(s => s.status === statusFilter) : shipments;
    return <Table dataSource={data} columns={columns} rowKey="id" pagination={false} style={{ marginTop: 16 }} />;
  };

  return (
    <div>
      <Card 
        bordered={true} 
        style={{ 
          marginBottom: 24, 
          borderRadius: "4px", 
          border: `1px solid ${isDark ? "#303030" : "#e8e8e8"}`, 
          boxShadow: isDark ? "none" : "0 1px 2px rgba(0,0,0,0.02)",
          background: isDark ? "#1f1f1f" : "#ffffff"
        }} 
        styles={{ body: { padding: "16px 24px" } }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px", fontWeight: 600 }}> Отгрузки товара</Title>
            <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block", color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)" }}>
              Оперативная сводка системы логистики завода. Оформление ТТН и контроль статусов.
            </Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} disabled={!canManage} style={{ height: "36px" }}>Создать отгрузку</Button>
        </div>
        
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={8}>
            <div style={{ 
              background: isDark ? "#111a2c" : "#f0f9ff", 
              padding: "12px", 
              borderRadius: "4px", 
              border: `1px solid ${isDark ? "#152542" : "#bae7ff"}` 
            }}>
              <Text type="secondary" style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0,0,0,0.45)" }}>Всего накладных</Text>
              <div style={{ fontSize: "20px", fontWeight: 600, color: "#1890ff" }}>{shipments.length}</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ 
              background: isDark ? "#2b2111" : "#fffbe6", 
              padding: "12px", 
              borderRadius: "4px", 
              border: `1px solid ${isDark ? "#4d3e1f" : "#ffe58f"}` 
            }}>
              <Text type="secondary" style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0,0,0,0.45)" }}>В пути (Транзит)</Text>
              <div style={{ fontSize: "20px", fontWeight: 600, color: "#faad14" }}>{shipments.filter(s => s.status === "transit").length}</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ 
              background: isDark ? "#142518" : "#f6ffed", 
              padding: "12px", 
              borderRadius: "4px", 
              border: `1px solid ${isDark ? "#1b3d22" : "#b7eb8f"}` 
            }}>
              <Text type="secondary" style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0,0,0,0.45)" }}>Успешно принято</Text>
              <div style={{ fontSize: "20px", fontWeight: 600, color: "#52c41a" }}>{shipments.filter(s => s.status === "shipped").length}</div>
            </div>
          </Col>
        </Row>
      </Card>

      <Tabs defaultActiveKey="all" items={[
        { key: "all", label: "Все отгрузки", children: renderTable() },
        { key: "transit", label: "В пути", children: renderTable("transit") },
        { key: "shipped", label: "Принято", children: renderTable("shipped") },
      ]} />

      <Modal title="Создать накладную" open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="date" label="Дата" initialValue={dayjs()}><DatePicker style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="warehouse" label="Склад" rules={[{ required: true }]}><Select><Option value="Главный склад Завод">Главный склад Завод</Option><Option value="Транзитный склад Чуй">Транзитный склад Чуй</Option></Select></Form.Item>
          <Form.Item name="client" label="Клиент" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="quantity" label="Количество" rules={[{ required: true, message: "Введите количество!" }]}><InputNumber style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="comment" label="Комментарий"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}