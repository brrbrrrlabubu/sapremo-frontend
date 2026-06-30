import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, Tabs, Tag, Typography, Space, Card, Row, Col, notification, Popconfirm } from "antd";
import { PlusOutlined, FileTextOutlined, CalendarOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { dataService } from "../services/dataService";
import type { Shipment } from "../services/dataService";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ShipmentsPage() {
  const currentUserRole = "admin"; 
  const canManage = currentUserRole === "admin" || currentUserRole === "manager";

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
    const randomAmount = Math.floor(10 + Math.random() * 40) * 1000;
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
    { title: "№ Документа", dataIndex: "docNumber", key: "docNumber", render: (text: string) => <Space><FileTextOutlined style={{ color: "#1890ff" }} /><strong>{text}</strong></Space> },
    { title: "Дата", dataIndex: "date", key: "date", render: (date: string) => <Space><CalendarOutlined type="secondary" />{date}</Space> },
    { title: "Склад", dataIndex: "warehouse", key: "warehouse" },
    { title: "Клиент", dataIndex: "client", key: "client", render: (text: string) => <Space><UserOutlined />{text}</Space> },
    { title: "Сумма", dataIndex: "amount", key: "amount", render: (amount: number) => <Text strong>{amount?.toLocaleString()} сом</Text> },
    { 
      title: "Статус", 
      dataIndex: "status", 
      key: "status", 
      render: (status: Shipment["status"]) => {
        const config: any = {
          shipped: { bg: "#efffe2", text: "#52C41A", icon: <CheckCircleOutlined />, label: "Принято" },
          transit: { bg: "#fff6da", text: "#FAAD14", icon: <CloseCircleOutlined />, label: "В пути" },
          discrepancy: { bg: "#ffdfde", text: "#F5222D", icon: <CloseCircleOutlined />, label: "С расхождением" },
          defective: { bg: "#fff5e5", text: "#FA8C16", icon: <CloseCircleOutlined />, label: "Брак" },
        };
        const current = config[status];
        return <Tag style={{ backgroundColor: current.bg, color: current.text, borderRadius: "4px" }}>{current.icon} {current.label}</Tag>;
      }
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: Shipment) => (
        <Space size="small">
          <Button type="text" icon={<PrinterOutlined />} onClick={() => {
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
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px", border: "1px solid #e8e8e8", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }} styles={{ body: { padding: "16px 24px" } }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px", fontWeight: 600 }}>🚚 Отгрузки товара</Title>
            <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block" }}>Оперативная сводка системы логистики завода. Оформление ТТН и контроль статусов.</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} disabled={!canManage} style={{ height: "36px" }}>Создать отгрузку</Button>
        </div>
        
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={8}>
            <div style={{ background: "#f0f9ff", padding: "12px", borderRadius: "4px", border: "1px solid #bae7ff" }}>
              <Text type="secondary">Всего накладных</Text>
              <div style={{ fontSize: "20px", fontWeight: 600, color: "#1890ff" }}>{shipments.length}</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ background: "#fffbe6", padding: "12px", borderRadius: "4px", border: "1px solid #ffe58f" }}>
              <Text type="secondary">В пути (Транзит)</Text>
              <div style={{ fontSize: "20px", fontWeight: 600, color: "#faad14" }}>{shipments.filter(s => s.status === "transit").length}</div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ background: "#f6ffed", padding: "12px", borderRadius: "4px", border: "1px solid #b7eb8f" }}>
              <Text type="secondary">Успешно принято</Text>
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
          <Form.Item name="warehouse" label="Склад"><Select><Option value="Главный склад Завод">Главный склад Завод</Option><Option value="Транзитный склад Чуй">Транзитный склад Чуй</Option></Select></Form.Item>
          <Form.Item name="client" label="Клиент"><Input /></Form.Item>
          <Form.Item name="comment" label="Комментарий"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}