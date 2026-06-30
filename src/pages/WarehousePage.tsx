import { useState, useEffect } from "react";
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Skeleton, 
  Empty, 
  Space, 
  Tag, 
  Typography, 
  Card,
  notification,
  Popconfirm 
} from "antd";
import { PlusOutlined, DatabaseOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const { Title, Text } = Typography;
const { Option } = Select;

interface Warehouse {
  id: string;
  name: string;
  type: "main" | "retail" | "transit";
  address: string;
  status: "active" | "inactive";
}

export default function WarehousePage() {
  const currentUserRole = "admin"; 
  const canManage = currentUserRole === "admin" || currentUserRole === "director";

  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      setWarehouses([
        { id: "1", name: "Главный склад Завод", type: "main", address: "г. Бишкек, ул. Промышленная 5", status: "active" },
        { id: "2", name: "Транзитный склад Чуй", type: "transit", address: "Чуйская обл., с. Лебединовка", status: "active" },
        { id: "3", name: "Розничная точка Вефа", type: "retail", address: "г. Бишкек, ТЦ Вефа", status: "inactive" },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const showCreateModal = () => {
    setEditingWarehouse(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    form.setFieldsValue(warehouse); 
    setIsModalOpen(true);
  };

  const handleSave = (values: any) => {
    if (editingWarehouse) {
      setWarehouses(warehouses.map(w => w.id === editingWarehouse.id ? { ...w, ...values } : w));
      notification.success({
        message: "Склад обновлен",
        description: `Изменения в складе "${values.name}" успешно сохранены.`,
      });
    } else {
      const newWarehouse: Warehouse = {
        id: Date.now().toString(),
        name: values.name,
        type: values.type,
        address: values.address,
        status: "active",
      };
      setWarehouses([newWarehouse, ...warehouses]);
      notification.success({
        message: "Склад добавлен",
        description: `Склад "${values.name}" успешно создан.`,
      });
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id: string, name: string) => {
    setWarehouses(warehouses.filter(w => w.id !== id));
    notification.warning({
      message: "Склад удален",
      description: `Склад "${name}" был успешно удален из системы.`,
    });
  };

  const columns = [
    {
      title: "Название склада",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Space><DatabaseOutlined style={{ color: "#1890ff" }} /> <strong>{text}</strong></Space>,
    },
    {
      title: "Тип",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const config: Record<string, { color: string; text: string }> = {
          main: { color: "blue", text: "Производственный" },
          transit: { color: "orange", text: "Транзитный" },
          retail: { color: "purple", text: "Розничный" },
        };
        return <Tag color={config[type]?.color}>{config[type]?.text}</Tag>;
      },
    },
    {
      title: "Адрес",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status === "active" ? "Активен" : "Заблокирован"}
        </Tag>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: Warehouse) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: "#1890ff" }} />} 
            disabled={!canManage}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Удалить склад?"
            description="Вы уверены, что хотите удалить этот склад из базы данных?"
            onConfirm={() => handleDelete(record.id, record.name)}
            okText="Да"
            cancelText="Нет"
            disabled={!canManage}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              disabled={!canManage}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Идеальный заголовок в рамочке, один в один как на странице отгрузок */}
      <Card 
        bordered={true} 
        style={{ 
          marginBottom: 24, 
          borderRadius: "4px", 
          border: "1px solid #e8e8e8",
          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
          background: "#ffffff"
        }}
        styles={{ body: { padding: "16px 24px" } }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div>
              <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px", fontWeight: 600 }}>
                🏭 Управление складами
              </Title>
              <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block" }}>
                Мониторинг, редактирование и удаление складских точек завода.
              </Text>
            </div>
            {/* Твоя Lottie анимация аккуратно встала рядом с текстом */}
            <div style={{ width: 40, height: 40 }}>
              <DotLottieReact 
                src="https://lottie.host/embed/8410b0fb-7182-4160-b747-d5d14df21598/E9G9XfRsh2.json" 
                autoplay 
                loop 
              />
            </div>
          </div>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showCreateModal}
            disabled={!canManage}
            style={{ height: "36px" }}
          >
            Добавить склад
          </Button>
        </div>
      </Card>

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : warehouses.length === 0 ? (
        <Empty description="Нет доступных складов" />
      ) : (
        <Table 
          dataSource={warehouses} 
          columns={columns} 
          rowKey="id" 
          pagination={false} 
        />
      )}

      <Modal
        title={editingWarehouse ? "Редактирование склада" : "Добавление нового склада"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Название склада"
            rules={[{ required: true, message: "Введите название склада" }]}
          >
            <Input placeholder="Например, Центральный ангар №1" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Тип склада"
            rules={[{ required: true, message: "Выберите тип" }]}
          >
            <Select placeholder="Выберите тип из списка">
              <Option value="main">Производственный</Option>
              <Option value="transit">Транзитный</Option>
              <Option value="retail">Розничный</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="address"
            label="Фактический адрес"
            rules={[{ required: true, message: "Укажите адрес" }]}
          >
            <Input.TextArea placeholder="Улица, номер здания, ориентиры" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}