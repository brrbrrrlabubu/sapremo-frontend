import { Table, Card, Typography, Row, Col, Statistic, Tabs, Tag } from "antd";
import { RiseOutlined, FallOutlined, BankOutlined } from "@ant-design/icons";
import { useUIStore } from "../store/useUIStore";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

export default function FinancePage() {
  const { t } = useTranslation();
  const { theme } = useUIStore();
  const isDark = theme === "dark";

  const stats = {
    totalRevenue: 1540000,
    debtAmount: 245000,
    activeShipments: 12,
  };

  const columns = [
    { title: t('finance.source'), dataIndex: "source", key: "source" },
    { title: t('finance.amountSom'), dataIndex: "amount", key: "amount", render: (val: number) => val.toLocaleString() },
    { 
      title: t('dashboard.status'), 
      dataIndex: "status", 
      key: "status", 
      render: (status: string) => (
        <Tag color={status === t('status.paid') ? "green" : "volcano"}>
          {status}
        </Tag>
      ) 
    },
  ];

  const data = [
    { key: "1", source: "Заказ №123", amount: 150000, status: t('status.paid') },
    { key: "2", source: "Заказ №124", amount: 95000, status: t('status.waiting') },
  ];

  return (
    <div>
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px", fontWeight: 600 }}> {t('finance.title')}</Title>
          <Text type="secondary" style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)" }}>
            {t('finance.subtitle')}
          </Text>
        </div>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card size="small" bordered={false} style={{ background: isDark ? "#142518" : "#f6ffed", border: isDark ? "1px solid #1b3d22" : "none" }}>
              <Statistic title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>{t('finance.totalRevenue')}</span>} value={stats.totalRevenue} prefix={<RiseOutlined />} suffix={t('shipments.som')} valueStyle={{ color: isDark ? "#52c41a" : "#3f8600" }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" bordered={false} style={{ background: isDark ? "#2c1517" : "#fff2f0", border: isDark ? "1px solid #4a1e22" : "none" }}>
              <Statistic title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>{t('finance.debt')}</span>} value={stats.debtAmount} prefix={<FallOutlined />} suffix={t('shipments.som')} valueStyle={{ color: isDark ? "#ff4d4f" : "#cf1322" }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" bordered={false} style={{ background: isDark ? "#111a2c" : "#f0f9ff", border: isDark ? "1px solid #152542" : "none" }}>
              <Statistic title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>{t('finance.activeShipments')}</span>} value={stats.activeShipments} prefix={<BankOutlined />} valueStyle={{ color: isDark ? "#1890ff" : "inherit" }} />
            </Card>
          </Col>
        </Row>
      </Card>

      <Tabs items={[
        { key: "1", label: t('finance.cashFlow'), children: <Table dataSource={data} columns={columns} pagination={false} scroll={{ x: 'max-content' }} /> },
        { key: "2", label: t('finance.report'), children: <div style={{ padding: 20, color: isDark ? "rgba(255, 255, 255, 0.85)" : "inherit" }}>{t('finance.reportPlaceholder')}</div> },
      ]} />
    </div>
  );
}