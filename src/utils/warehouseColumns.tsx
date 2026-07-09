import { Space, Button, Tag, Popconfirm } from "antd";
import { DatabaseOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Warehouse } from "../types/warehouse";

export const getWarehouseColumns = (
  token: any, 
  onEdit: (record: Warehouse) => void, 
  onDelete: (id: string) => void
) => [
  { 
    title: "Название", 
    dataIndex: "name", 
    render: (t: string) => <Space><DatabaseOutlined style={{ color: token.colorPrimary }} /> <strong>{t}</strong></Space> 
  },
  { title: "Тип", dataIndex: "type", render: (t: string) => <Tag>{t.toUpperCase()}</Tag> },
  { title: "Адрес", dataIndex: "address" },
  { title: "Статус", dataIndex: "status", render: (s: string) => (
      <Tag color={s === "active" ? "success" : "error"}>
        {s === "active" ? "Активен" : "Неактивен"}
      </Tag>
    ) 
  },
  { title: "Действия", render: (_: any, r: Warehouse) => (
      <Space>
        <Button icon={<EditOutlined />} onClick={() => onEdit(r)} />
        <Popconfirm title="Удалить?" onConfirm={() => onDelete(r.id)}>
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
  )}
];