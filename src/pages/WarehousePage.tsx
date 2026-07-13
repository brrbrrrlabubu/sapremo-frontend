import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Skeleton, theme, notification } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import type { Warehouse } from "../types/warehouse"; 
import { getWarehouseColumns } from "../utils/warehouseColumns";
import { WAREHOUSES } from "../constants/warehouses";

export default function WarehousePage() {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    setWarehouses(WAREHOUSES.map(w => ({ ...w, status: "active" })));
    setLoading(false);
  }, []);

  const handleSave = (values: any) => {
    setConfirmLoading(true);
    setTimeout(() => {
      if (editingWarehouse) {
        setWarehouses(warehouses.map(w => w.id === editingWarehouse.id ? { ...w, ...values } : w));
        notification.success({ message: "Склад обновлен" });
      } else {
        setWarehouses([{ id: Date.now().toString(), ...values, status: "active" }, ...warehouses]);
        notification.success({ message: "Склад добавлен" });
      }
      setConfirmLoading(false);
      setIsModalOpen(false);
      form.resetFields();
    }, 500);
  };

  const columns = getWarehouseColumns(
    token,
    (r) => { setEditingWarehouse(r); form.setFieldsValue(r); setIsModalOpen(true); },
    (id) => setWarehouses(warehouses.filter(w => w.id !== id))
  );

  return (
    <div>
      <PageHeader title="🏭 Управление складами" />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => { setEditingWarehouse(null); form.resetFields(); setIsModalOpen(true); }}
        >
          Добавить склад
        </Button>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <Table dataSource={warehouses} columns={columns} rowKey="id" pagination={false} />
      )}

      <Modal 
        title={editingWarehouse ? "Редактировать склад" : "Добавить склад"} 
        open={isModalOpen} 
        onOk={() => form.submit()} 
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={confirmLoading}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item 
            name="name" 
            label="Название" 
            rules={[
              { required: true, message: "Введите название склада!" },
              { whitespace: true, message: "Название не может состоять из пробелов" },
              { min: 3, message: "Минимум 3 символа" }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="type" 
            label="Тип" 
            rules={[{ required: true, message: "Выберите тип склада!" }]}
          >
            <Select placeholder="Выберите тип">
              <Select.Option value="main">Производственный</Select.Option>
              <Select.Option value="transit">Транзитный</Select.Option>
              <Select.Option value="retail">Розничный</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item 
            name="address" 
            label="Адрес" 
            rules={[
              { required: true, message: "Введите адрес склада!" },
              { whitespace: true, message: "Адрес не может состоять из пробелов" }
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}