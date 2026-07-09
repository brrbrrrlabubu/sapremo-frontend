import { Space, Tag, Typography, Button, Popconfirm } from "antd";
import { FileTextOutlined, CalendarOutlined, DatabaseOutlined, DeleteOutlined, PrinterOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const getShipmentColumns = (
  token: any, 
  onPrint: () => void, 
  onConfirm: (id: string) => void, 
  onDelete: (id: string) => void
) => [
  { title: "№ Документа", dataIndex: "docNumber", render: (t: string) => <Space><FileTextOutlined style={{ color: token.colorPrimary }} /><strong>{t}</strong></Space> },
  { title: "Дата", dataIndex: "date", render: (d: string) => <Space><CalendarOutlined />{d}</Space> },
  { title: "Склад", dataIndex: "warehouse" },
  { title: "Товар", dataIndex: "client", render: (t: string) => <Space><DatabaseOutlined />{t}</Space> },
  { title: "Сумма", dataIndex: "amount", render: (a: number) => <Text strong>{a.toLocaleString()} сом</Text> },
  { title: "Статус", dataIndex: "status", render: (s: string) => <Tag color={s === "shipped" ? "success" : "warning"}>{s === "shipped" ? "Принято" : "В пути"}</Tag> },
  { title: "Действия", render: (_: any, r: any) => (
      <Space>
        <Button type="text" icon={<PrinterOutlined />} onClick={onPrint} />
        {r.status === "transit" && <Button type="text" onClick={() => onConfirm(r.id)}>Принять</Button>}
        <Popconfirm title="Удалить?" onConfirm={() => onDelete(r.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
  )}
];