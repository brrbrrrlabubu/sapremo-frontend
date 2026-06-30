
import { Table, Card, Typography, Row, Col, Statistic, Tabs, Tag } from "antd";
import { RiseOutlined, FallOutlined, BankOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function FinancePage() {
  // Имитация данных (замени на реальный вызов из твоего dataService, если нужно)
  const stats = {
    totalRevenue: 1540000,
    debtAmount: 245000,
    activeShipments: 12,
  };

  const columns = [
    { title: "Источник", dataIndex: "source", key: "source" },
    { title: "Сумма (сом)", dataIndex: "amount", key: "amount", render: (val: number) => val.toLocaleString() },
    { title: "Статус", dataIndex: "status", key: "status", render: (status: string) => <Tag color={status === "Оплачено" ? "green" : "volcano"}>{status}</Tag> },
  ];

  const data = [
    { key: "1", source: "Заказ №123", amount: 150000, status: "Оплачено" },
    { key: "2", source: "Заказ №124", amount: 95000, status: "В ожидании" },
  ];

  return (
    <div>
      {/* Шапка с аналитикой */}
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ color: '#1890ff', margin: 0 }}>💰 Финансовая аналитика</Title>
          <Text type="secondary">Оперативная сводка по доходам, задолженностям и движению денежных средств.</Text>
        </div>

        <Row gutter={16}>
          <Col span={8}>
            <Card size="small" bordered={false} style={{ background: "#f6ffed" }}>
              <Statistic title="Общая выручка" value={stats.totalRevenue} prefix={<RiseOutlined />} suffix="сом" valueStyle={{ color: '#3f8600' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" bordered={false} style={{ background: "#fff2f0" }}>
              <Statistic title="Задолженность складов" value={stats.debtAmount} prefix={<FallOutlined />} suffix="сом" valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" bordered={false} style={{ background: "#f0f9ff" }}>
              <Statistic title="Активных отгрузок" value={stats.activeShipments} prefix={<BankOutlined />} />
            </Card>
          </Col>
        </Row>
      </Card>

      <Tabs items={[
        { key: "1", label: "Движение средств", children: <Table dataSource={data} columns={columns} pagination={false} /> },
        { key: "2", label: "Отчет по складам", children: <div style={{ padding: 20 }}>Здесь будет детализированный отчет...</div> },
      ]} />
    </div>
  );
}