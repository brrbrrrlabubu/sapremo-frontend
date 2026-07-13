import { Table, Card, Row, Col, Statistic, Tabs, Tag, Empty } from "antd"; 
import { RiseOutlined, FallOutlined, BankOutlined } from "@ant-design/icons";
import { useUIStore } from "../store/useUIStore"; 
import PageHeader from "../components/PageHeader"; 
import { useShipmentStore } from "../store/shipmentStore";

export default function FinancePage() {
  const { theme } = useUIStore();
  const isDark = theme === "dark";
  const { shipments } = useShipmentStore();

  // 1. Вычисляем данные для статистики прямо из массива отгрузок
  const totalRevenue = shipments
    .filter((s) => s.status === "shipped") // У тебя в коде статус "shipped", а не "Оплачено"
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const debtAmount = shipments
    .filter((s) => s.status !== "shipped") // Всё, что не отгружено - считаем задолженностью
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const activeShipmentsCount = shipments.filter((s) => s.status === "transit").length;

  // 2. Настройка колонок таблицы
  const columns = [
    { title: "Источник", dataIndex: "source", key: "source" },
    { 
      title: "Сумма (сом)", 
      dataIndex: "amount", 
      key: "amount", 
      // Если val нет, подставляем 0, чтобы код не падал
      render: (val: number) => (val ? val.toLocaleString() : "0") 
    },
    { 
      title: "Статус", 
      dataIndex: "status", 
      key: "status", 
      render: (status: string) => (
        <Tag color={status === "Оплачено" ? (isDark ? "green-dark" : "green") : (isDark ? "volcano-dark" : "volcano")}>
          {status}
        </Tag>
      ) 
    },
  ];

  // 3. Формируем данные для таблицы
  const dataSource = shipments.map((s) => ({
    key: s.id,
    source: s.docNumber, // Используем docNumber вместо orderNumber
    amount: s.amount,    // Используем amount вместо totalAmount
    status: s.status === "transit" ? "В пути" : "Отгружено", // Красивый вывод статуса
  }));

  return (
    <div>
      <PageHeader title="💰 Финансовая аналитика" />
      
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" bordered={false} style={{ background: isDark ? "#142518" : "#f6ffed", border: isDark ? "1px solid #1b3d22" : "none" }}>
              <Statistic 
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>Общая выручка</span>} 
                value={totalRevenue} 
                prefix={<RiseOutlined />} 
                suffix="сом" 
                valueStyle={{ color: isDark ? "#52c41a" : "#3f8600" }} 
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" bordered={false} style={{ background: isDark ? "#2c1517" : "#fff2f0", border: isDark ? "1px solid #4a1e22" : "none" }}>
              <Statistic 
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>Задолженность складов</span>} 
                value={debtAmount} 
                prefix={<FallOutlined />} 
                suffix="сом" 
                valueStyle={{ color: isDark ? "#ff4d4f" : "#cf1322" }} 
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" bordered={false} style={{ background: isDark ? "#111a2c" : "#f0f9ff", border: isDark ? "1px solid #152542" : "none" }}>
              <Statistic 
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>Активных отгрузок</span>} 
                value={activeShipmentsCount} 
                prefix={<BankOutlined />} 
                valueStyle={{ color: isDark ? "#1890ff" : "inherit" }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      <Tabs items={[
        { 
          key: "1", 
          label: "Движение средств", 
          children: dataSource.length > 0 
            ? <Table dataSource={dataSource} columns={columns} pagination={false} /> 
            : <Empty description="Нет данных об отгрузках" />
        },
        { key: "2", label: "Отчет по складам", children: <div style={{ padding: 20 }}>Раздел находится в разработке...</div> },
      ]} />
    </div>
  );
}