import { Card, Row, Col, Typography, Statistic, Table } from "antd";
import { LineChartOutlined, TeamOutlined, FileTextOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

export default function AnalyticsPage() {
  const { t } = useTranslation();

  const dataSource = [
    { key: '1', name: t('shipments.mainWarehouse'), turnover: `850,000 ${t('shipments.som')}`, status: t('status.active') },
    { key: '2', name: t('shipments.transitWarehouse'), turnover: `420,000 ${t('shipments.som')}`, status: t('status.active') },
  ];

  const columns = [
    { title: t('analytics.warehouseName'), dataIndex: 'name', key: 'name' },
    { title: t('analytics.turnover'), dataIndex: 'turnover', key: 'turnover' },
    { title: t('dashboard.status'), dataIndex: 'status', key: 'status' },
  ];

  return (
    <div>
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }} styles={{ body: { padding: "20px 24px" } }}>
        <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px" }}>{t('analytics.title')}</Title>
        <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block" }}>{t('analytics.subtitle')}</Text>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: t('analytics.avgTurnover'), value: "513,000", suffix: t('shipments.som'), icon: <LineChartOutlined /> },
          { title: t('analytics.activePoints'), value: "3", icon: <TeamOutlined /> },
          { title: t('analytics.requests'), value: "142", icon: <FileTextOutlined /> },
          { title: t('analytics.inTransit'), value: "28", icon: <ShoppingCartOutlined /> },
        ].map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card hoverable style={{ textAlign: 'center', borderRadius: '4px' }}>
              <Statistic title={item.title} value={item.value} suffix={item.suffix} prefix={item.icon} valueStyle={{ fontSize: "22px", fontWeight: 600 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={t('analytics.details')} bordered={true} style={{ borderRadius: "4px" }}>
        <Table dataSource={dataSource} columns={columns} pagination={false} scroll={{ x: 'max-content' }} />
      </Card>
    </div>
  );
}