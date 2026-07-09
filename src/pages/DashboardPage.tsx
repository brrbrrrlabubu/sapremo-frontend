import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Space } from 'antd';
import { 
  ArrowUpOutlined, 
  InboxOutlined, 
  TruckOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { dataService } from '../services/dataService';
import type { Shipment } from '../services/dataService';
import noDataIcon from '../assets/No-Data.svg';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const CustomNoData: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <img src={noDataIcon} alt="No Data" style={{ width: '120px', height: '120px', marginBottom: '4px' }} />
      <div style={{ color: '#999' }}>{t('dashboard.noData')}</div>
    </div>
  );
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const [shipments, setShipments] = useState<Shipment[]>(dataService.getShipments());

  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => setShipments(dataService.getShipments()));
    return () => unsubscribe();
  }, []);

  const totalItems = 12540 + (shipments.length * 150);
  const totalShipmentsCount = shipments.length;
  const transitCount = shipments.filter(s => s.status === "transit").length;

  const metrics = [
    { title: t('dashboard.stock'), value: totalItems, suffix: ` ${t('dashboard.pcs')}`, icon: <InboxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />, color: "#e6f7ff", trend: t('dashboard.updating') },
    { title: t('dashboard.totalShipments'), value: totalShipmentsCount, suffix: ` ${t('dashboard.docs')}`, icon: <TruckOutlined style={{ fontSize: '24px', color: '#52c41a' }} />, color: "#f6ffed", trend: `${t('dashboard.trucksInTransit')} ${transitCount}` }
  ];

  const recentActivityColumns = [
    { title: t('dashboard.docNum'), dataIndex: 'docNumber', key: 'docNumber', render: (text: string) => <Text strong style={{ color: '#1890ff' }}>{text}</Text> },
    { title: t('dashboard.destWarehouse'), dataIndex: 'warehouse', key: 'warehouse' },
    { title: t('dashboard.status'), dataIndex: 'status', key: 'status', render: (status: string) => {
        const config: any = {
          shipped: { color: "success", label: t('status.shipped') },
          transit: { color: "processing", label: t('status.transit') },
          discrepancy: { color: "error", label: t('status.discrepancy') },
          defective: { color: "warning", label: t('status.defective') },
        };
        const current = config[status] || { color: "default", label: status };
        return <Tag color={current.color}>{current.label}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 24, borderRadius: "4px" }}>
        <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px" }}> {t('dashboard.title')}</Title>
        <Text type="secondary">{t('dashboard.subtitle')}</Text>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {metrics.map((item, index) => (
          <Col xs={24} sm={12} key={index}>
            <Card bordered={true} style={{ borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Text type="secondary" strong>{item.title}</Text>
                <div style={{ background: item.color, padding: '8px', borderRadius: '4px' }}>{item.icon}</div>
              </div>
              <Statistic value={item.value} suffix={item.suffix} valueStyle={{ fontSize: '26px', fontWeight: 'bold' }} />
              <div style={{ marginTop: '8px' }}>
                <Space><ArrowUpOutlined style={{ color: '#52c41a' }} /><span style={{ color: '#52c41a', fontWeight: 500 }}>{item.trend}</span></Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
            <Card title={t('dashboard.recentActivity')} bordered={true} style={{ borderRadius: '4px' }}>
                <Table columns={recentActivityColumns} dataSource={shipments} rowKey="id" pagination={false} locale={{ emptyText: <CustomNoData /> }} scroll={{ x: 'max-content' }} />
            </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title={t('dashboard.support')} bordered={true} style={{ borderRadius: '4px' }}>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneOutlined /> <Text strong>{t('dashboard.manager')}</Text> <Text>+996 555 123 456</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MailOutlined /> <Text strong>{t('dashboard.email')}</Text> <Text>support@sapremo.kg</Text>
              </div>
            </div>
            <Text type="secondary" style={{ display: 'block', marginTop: '12px' }}>
              {t('dashboard.supportDesc')}
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}