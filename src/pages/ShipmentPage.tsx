import { useState } from "react";
import { Table, Button, Modal, Form, Select, DatePicker, Tabs, InputNumber, theme, notification, Input} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useShipmentStore } from "../store/shipmentStore"; 
import { inventory } from "../constants/products"; // ИСПРАВЛЕНО: теперь путь верный
import PageHeader from "../components/PageHeader";
import { getShipmentColumns } from "../utils/shipmentColumns";
import { WAREHOUSES } from "../constants/warehouses";

export default function ShipmentsPage() {
  const { token } = theme.useToken();
  const { shipments, addShipment, updateStatus, deleteShipment } = useShipmentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = (values: any) => {
  const selectedProduct = inventory.find(p => p.name === values.productName);
  
  const price = selectedProduct?.price || 0;
  const quantity = values.quantity || 0;

  addShipment({
    id: Date.now().toString(),
    docNumber: `НАК-00${Math.floor(100 + Math.random() * 900)}`,
    date: values.date.format("YYYY-MM-DD"),
    warehouse: values.warehouse,
    client: values.productName, // Имя товара
    status: "transit",
    comment: values.managerComment || "",
    amount: price * quantity // Четкий расчет
  });

  setIsModalOpen(false);
  form.resetFields();
  notification.success({ message: "Отгрузка создана" });
};

  const columns = getShipmentColumns(
    token, 
    () => window.print(), 
    (id: string) => updateStatus(id, "shipped"),
    deleteShipment
  );

  return (
    <div>
      <PageHeader title="🚚 Отгрузки товара" />
      <div style={{ margin: 24, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Создать</Button>
      </div>
      
      <Tabs items={[
        { key: "all", label: "Все", children: <Table dataSource={shipments} columns={columns} rowKey="id" /> },
        { key: "transit", label: "В пути", children: <Table dataSource={shipments.filter(s => s.status === "transit")} columns={columns} rowKey="id" /> },
      ]} />

      <Modal title="Создать накладную" open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="date" label="Дата" rules={[{ required: true, message: "Выберите дату" }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="warehouse" label="Склад" rules={[{ required: true, message: "Выберите склад" }]}>
            <Select placeholder="Выберите склад">
              {WAREHOUSES.map((w) => (
                <Select.Option key={w.id} value={w.name}>
                  {w.name}
                </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="productName" label="Товар" rules={[{ required: true, message: "Выберите товар" }]}>
            <Select placeholder="Выберите товар">
              {inventory.map((p: any) => <Select.Option key={p.id} value={p.name}>{p.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Количество" rules={[{ required: true, message: "Введите количество" }, { type: 'number', min: 1, message: "Минимум 1 шт" }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="managerComment" label="Комментарий зав. склада">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}