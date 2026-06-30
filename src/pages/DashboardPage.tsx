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

const { Title, Text } = Typography;

const CustomNoData: React.FC = () => (
  <div style={{ textAlign: 'center', padding: '32px 0' }}>
    <img src={noDataIcon} alt="No Data" style={{ width: '120px', height: '120px', marginBottom: '4px' }} />
  </div>
);

const recentActivityColumns = [
  { title: '№ Документа', dataIndex: 'docNumber', key: 'docNumber', render: (text: string) => <Text strong style={{ color: '#1890ff' }}>{text}</Text> },
  { title: 'Склад назначения', dataIndex: 'warehouse', key: 'warehouse' },
  { title: 'Статус', dataIndex: 'status', key: 'status', render: (status: string) => {
      const config: any = {
        shipped: { color: "success", label: "Принято" },
        transit: { color: "processing", label: "В пути" },
        discrepancy: { color: "error", label: "С расхождениями" },
        defective: { color: "warning", label: "Брак" },
      };
      const current = config[status] || { color: "default", label: status };
      return <Tag color={current.color}>{current.label}</Tag>;
    },
  },
];

export default function DashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>(dataService.getShipments());

  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => setShipments(dataService.getShipments()));
    return () => unsubscribe();
  }, []);

  const totalItems = 12540 + (shipments.length * 150);
  const totalShipmentsCount = shipments.length;
  const transitCount = shipments.filter(s => s.status === "transit").length;

  const metrics = [
    { title: "Остатки товаров", value: totalItems, suffix: " шт.", icon: <InboxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />, color: "#e6f7ff", trend: "Обновляется автоматически" },
    { title: "Всего отгрузок", value: totalShipmentsCount, suffix: " док.", icon: <TruckOutlined style={{ fontSize: '24px', color: '#52c41a' }} />, color: "#f6ffed", trend: `Машин в пути: ${transitCount}` }
  ];

  return (
    <div>
      <Card style={{ marginBottom: 24, borderRadius: "4px" }}>
        <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px" }}>📊 Главная панель управления</Title>
        <Text type="secondary">Оперативная сводка системы логистики завода.</Text>
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
            <Card title="Последняя активность" bordered={true} style={{ borderRadius: '4px' }}>
                <Table columns={recentActivityColumns} dataSource={shipments} rowKey="id" pagination={false} locale={{ emptyText: <CustomNoData /> }} />
            </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Поддержка и связь" bordered={true} style={{ borderRadius: '4px' }}>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneOutlined /> <Text strong>Менеджер склада:</Text> <Text>+996 555 123 456</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MailOutlined /> <Text strong>Email:</Text> <Text>support@sapremo.kg</Text>
              </div>
            </div>
            <Text type="secondary" style={{ display: 'block', marginTop: '12px' }}>
              Если возникли вопросы по приёмке или расхождениям, свяжитесь с ответственным менеджером.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}