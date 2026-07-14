import { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Statistic, Table, App } from "antd";
import { LineChartOutlined, TeamOutlined, FileTextOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { WarehouseService, type WarehouseStat } from "../services/warehouse.service";
import { PALETTE } from "../theme/tokens";

const { Title, Text } = Typography;

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  
  const [stats, setStats] = useState<WarehouseStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await WarehouseService.getStats();
      setStats(data);
    } catch (error) {
      notification.error({ message: t('analytics.errorLoading', 'Ошибка загрузки статистики') });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: t('analytics.warehouseName', 'Название склада'), dataIndex: 'warehouse_name', key: 'warehouse_name', render: (val: string, record: WarehouseStat) => val || record.name || 'N/A' },
    { title: t('analytics.turnover', 'Оборот / Значение'), dataIndex: 'value', key: 'value', render: (val: string, record: WarehouseStat) => val || record.total_amount || record.count || '0' },
  ];

  return (
    <div>
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }} styles={{ body: { padding: "20px 24px" } }}>
        <Title level={3} style={{ color: PALETTE.primary, margin: 0, fontSize: "20px" }}>{t('analytics.title')}</Title>
        <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block" }}>{t('analytics.subtitle')}</Text>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: t('analytics.avgTurnover'), value: "N/A", suffix: t('shipments.som'), icon: <LineChartOutlined /> },
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
          rowKey={(record, i) => record.id || record.warehouse_id || record.name || String(i)} 
          pagination={false} 
          scroll={{ x: 'max-content' }} 
          locale={{ emptyText: t('analytics.noData', 'Нет данных для отображения.') }}
        />
      </Card>
    </div>
  );
}