import { Table, Card, Row, Col, Statistic, Tabs, Tag, Empty } from "antd"; 
import { RiseOutlined, FallOutlined, BankOutlined } from "@ant-design/icons";
import { useUIStore } from "../store/useUIStore"; 
import PageHeader from "../components/PageHeader"; 


export default function FinancePage() {
  const { theme } = useUIStore();
  const isDark = theme === "dark";

  const stats = {
    totalRevenue: 1540000,
    debtAmount: 245000,
    activeShipments: 12,
  };

  const columns = [
    { title: "Источник", dataIndex: "source", key: "source" },
    { title: "Сумма (сом)", dataIndex: "amount", key: "amount", render: (val: number) => val.toLocaleString() },
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

  const data = [
    { key: "1", source: "Заказ №123", amount: 150000, status: "Оплачено" },
    { key: "2", source: "Заказ №124", amount: 95000, status: "В ожидании" },
  ];

  return (
    <div>
      <PageHeader title="💰 Финансовая аналитика" />
      {/* Статистику можно оставить статичной, пока нет сложной логики расчета */}
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card 
              size="small" 
              bordered={false} 
              style={{ 
                // В темноте используем приглушенный темно-зеленый, на свету - мягкий салатовый
                background: isDark ? "#142518" : "#f6ffed",
                border: isDark ? "1px solid #1b3d22" : "none"
              }}
            >
              <Statistic 
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>Общая выручка</span>} 
                value={stats.totalRevenue} 
                prefix={<RiseOutlined />} 
                suffix="сом" 
                valueStyle={{ color: isDark ? "#52c41a" : "#3f8600" }} 
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card 
              size="small" 
              bordered={false} 
              style={{ 
                // В темноте - благородный винный/бордовый, на свету - нежно-розовый
                background: isDark ? "#2c1517" : "#fff2f0",
                border: isDark ? "1px solid #4a1e22" : "none"
              }}
            >
              <Statistic 
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>Задолженность складов</span>} 
                value={stats.debtAmount} 
                prefix={<FallOutlined />} 
                suffix="сом" 
                valueStyle={{ color: isDark ? "#ff4d4f" : "#cf1322" }} 
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card 
              size="small" 
              bordered={false} 
              style={{ 
                // В темноте - глубокий синий, на свету - голубой
                background: isDark ? "#111a2c" : "#f0f9ff",
                border: isDark ? "1px solid #152542" : "none"
              }}
            >
              <Statistic 
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>Активных отгрузок</span>} 
                value={stats.activeShipments} 
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
          children: data.length > 0 
            ? <Table dataSource={data} columns={columns} pagination={false} /> 
            : <Empty description="Нет данных об отгрузках" /> // Теперь тут красиво отображается пустота
        },
        { key: "2", label: "Отчет по складам", children: <div style={{ padding: 20 }}>Раздел находится в разработке...</div> },
      ]} />
    </div>
  );
}