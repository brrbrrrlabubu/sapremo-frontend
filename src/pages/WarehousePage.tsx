import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Skeleton, Empty, Space, Tag, Typography, Card, notification, Popconfirm } from "antd";
import { PlusOutlined, DatabaseOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useUIStore } from "../store/useUIStore";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const currentUserRole = "admin"; 
  const canManage = currentUserRole === "admin" || currentUserRole === "director";

  const { theme } = useUIStore();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      setWarehouses([
        { id: "1", name: t('shipments.mainWarehouse'), type: "main", address: "г. Бишкек, ул. Промышленная 5", status: "active" },
        { id: "2", name: t('shipments.transitWarehouse'), type: "transit", address: "Чуйская обл., с. Лебединовка", status: "active" },
        { id: "3", name: "Розничная точка Вефа", type: "retail", address: "г. Бишкек, ТЦ Вефа", status: "inactive" },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [t]);

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
        message: t('actions.edit'),
        description: values.name,
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
        message: t('actions.create'),
        description: values.name,
      });
    }
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDelete = (id: string, name: string) => {
    setWarehouses(warehouses.filter(w => w.id !== id));
    notification.warning({
      message: t('actions.delete'),
      description: name,
    });
  };

  const columns = [
    {
      title: t('warehouses.name'),
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <Space>
          <DatabaseOutlined style={{ color: "#1890ff" }} /> 
          <strong style={{ color: isDark ? "rgba(255, 255, 255, 0.85)" : "#000000" }}>{text}</strong>
        </Space>
      ),
    },
    {
      title: t('warehouses.type'),
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const config: Record<string, { color: string; text: string }> = {
          main: { color: "blue", text: t('warehouses.typeMain') },
          transit: { color: "orange", text: t('warehouses.typeTransit') },
          retail: { color: "purple", text: t('warehouses.typeRetail') },
        };
        return <Tag color={config[type]?.color}>{config[type]?.text}</Tag>;
      },
    },
    {
      title: t('warehouses.address'),
      dataIndex: "address",
      key: "address",
    },
    {
      title: t('dashboard.status'),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "success" : "error"}>
          {status === "active" ? t('status.active') : t('status.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: "actions",
      render: (_: any, record: Warehouse) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined style={{ color: "#1890ff" }} />} disabled={!canManage} onClick={() => showEditModal(record)} />
          <Popconfirm title={t('warehouses.deleteConfirmTitle')} description={t('warehouses.deleteConfirmDesc')} onConfirm={() => handleDelete(record.id, record.name)} okText={t('common.yes')} cancelText={t('common.no')} disabled={!canManage}>
            <Button type="text" danger icon={<DeleteOutlined />} disabled={!canManage} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }} styles={{ body: { padding: "16px 24px" } }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
            <div>
              <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px", fontWeight: 600 }}>{t('warehouses.title')}</Title>
              <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block", color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)" }}>{t('warehouses.subtitle')}</Text>
            </div>
            <div style={{ width: 40, height: 40, flexShrink: 0 }}>
              <DotLottieReact src="https://lottie.host/embed/8410b0fb-7182-4160-b747-d5d14df21598/E9G9XfRsh2.json" autoplay loop />
            </div>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal} disabled={!canManage} style={{ height: "36px", flexShrink: 0 }}>{t('warehouses.add')}</Button>
        </div>
      </Card>

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : warehouses.length === 0 ? (
        <Empty description={t('warehouses.noData')} />
      ) : (
        <Table dataSource={warehouses} columns={columns} rowKey="id" pagination={false} scroll={{ x: 'max-content' }} />
      )}

      <Modal title={editingWarehouse ? t('warehouses.editModalTitle') : t('warehouses.addModalTitle')} open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)} okText={t('actions.save')} cancelText={t('actions.cancel')}>
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t('warehouses.name')} rules={[{ required: true, message: t('warehouses.enterName') }]}><Input placeholder={t('warehouses.namePlaceholder')} /></Form.Item>
          <Form.Item name="type" label={t('warehouses.type')} rules={[{ required: true, message: t('warehouses.selectType') }]}>
            <Select placeholder={t('warehouses.typePlaceholder')}>
              <Option value="main">{t('warehouses.typeMain')}</Option>
              <Option value="transit">{t('warehouses.typeTransit')}</Option>
              <Option value="retail">{t('warehouses.typeRetail')}</Option>
            </Select>
          </Form.Item>
          <Form.Item name="address" label={t('warehouses.address')} rules={[{ required: true, message: t('warehouses.enterAddress') }]}><Input.TextArea placeholder={t('warehouses.addressPlaceholder')} rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}