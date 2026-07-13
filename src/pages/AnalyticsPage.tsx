import { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Statistic, Table, App } from "antd";
import { LineChartOutlined, TeamOutlined, FileTextOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { axiosClient } from "../api/axiosClient";

const { Title, Text } = Typography;

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/stats/warehouses/');
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setStats(data);
    } catch (error) {
      notification.error({ message: t('common.errorLoading') });
    } finally {
      setLoading(false);
    }
  };

  // Колонки таблицы, адаптированные под данные от API
  const columns = [
    { title: t('analytics.table.warehouse'), dataIndex: 'warehouse_name', key: 'warehouse_name' },
    { title: t('analytics.table.value'), dataIndex: 'value', key: 'value', render: (val: any) => val?.toLocaleString() },
  ];

  return (
    <div>
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }}>
        <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px" }}>{t('analytics.title')}</Title>
        <Text type="secondary">{t('analytics.subtitle')}</Text>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: t('analytics.avgTurnover'), value: "N/A", suffix: t('common.som'), icon: <LineChartOutlined /> },
          { title: t('analytics.activePoints'), value: stats.length.toString(), icon: <TeamOutlined /> },
          { title: t('analytics.requests'), value: "N/A", icon: <FileTextOutlined /> },
          { title: t('analytics.inTransit'), value: "N/A", icon: <ShoppingCartOutlined /> },
        ].map((item, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card hoverable style={{ textAlign: 'center', borderRadius: '4px' }}>
              <Statistic title={item.title} value={item.value} suffix={item.suffix} prefix={item.icon} valueStyle={{ fontSize: "22px", fontWeight: 600 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={t('analytics.details')} bordered={true} style={{ borderRadius: "4px" }}>
        <Table 
          loading={loading}
          dataSource={stats} 
          columns={columns} 
          rowKey={(record: any) => record.id || record.warehouse_id} 
          pagination={false} 
          scroll={{ x: 'max-content' }} 
        />
      </Card>
    </div>
  );
}