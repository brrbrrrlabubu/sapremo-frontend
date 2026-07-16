import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Typography, Table, Tag, Button, Select, Space, App, Form, Input, Row, Col } from 'antd';
import { 
  FilePdfOutlined,
  PrinterOutlined,
  CheckOutlined,
  SendOutlined
} from '@ant-design/icons';
import { ShipmentService } from '../services/shipment.service';
import type { Shipment } from '../types/api.types';
import { useUserStore } from '../store/useUserStore';
import { UserRole } from '../types/enums';

const { Title } = Typography;

export default function ShipmentPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const { user } = useUserStore();
  const isFactory = user?.role === UserRole.Factory;
  const [form] = Form.useForm();

  const loadData = async (page: number) => {
    if (isFactory) return;
    setLoading(true);
    try {
      const res = await ShipmentService.getShipments(page, pageSize);
      setTotal(res.count);
      
      const flattenedData: any[] = [];
      res.results.forEach((shipment: Shipment) => {
        if (shipment.items && shipment.items.length > 0) {
          shipment.items.forEach(item => {
            flattenedData.push({
              id: item.id || Math.random().toString(),
              shipmentId: shipment.id,
              date: new Date(shipment.shipment_date).toLocaleDateString('ru-RU'),
              request: shipment.id ? shipment.id.slice(0, 8) : "REQ-XXX",
              car: shipment.truck_number,
              product: item.product_id ? t('shipment.productLabel', { id: item.product_id.slice(0,8) }) : "—",
              status: shipment.status || "pending",
            });
          });
        } else {
          flattenedData.push({
            id: shipment.id,
            shipmentId: shipment.id,
            date: new Date(shipment.shipment_date).toLocaleDateString('ru-RU'),
            request: shipment.id ? shipment.id.slice(0, 8) : "REQ-XXX",
            car: shipment.truck_number,
            product: "—",
            status: shipment.status || "pending",
          });
        }
      });
      setData(flattenedData);
    } catch (err) {
      console.error(err);
      message.error(t('shipment.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, isFactory]);

  const columns = [
    { title: t('shipment.dateCol'), dataIndex: 'date', key: 'date' },
    { title: t('shipment.requestCol'), dataIndex: 'request', key: 'request' },
    { title: t('shipment.carCol'), dataIndex: 'car', key: 'car' },
    { title: t('shipment.productCol'), dataIndex: 'product', key: 'product' },
    { 
      title: t('shipment.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'shipped' ? 'success' : 'warning'} style={{ borderRadius: '4px' }}>
          {status}
        </Tag>
      )
    },
    { 
      title: t('shipment.actionsCol'), 
      key: 'action',
      render: () => (
        <Space size="small">
          <Button icon={<FilePdfOutlined />} size="small" />
          <Button icon={<PrinterOutlined />} size="small" />
          <Button type="primary" icon={<CheckOutlined />} size="small">{t('shipment.issue')}</Button>
        </Space>
      )
    },
  ];

  if (isFactory) {
    return (
      <Card bordered={false} style={{ borderRadius: '8px' }}>
        <Title level={4} style={{ marginTop: 0 }}>{t('shipment.factoryTitle')}</Title>
        <Form form={form} layout="vertical" onFinish={() => message.success(t('shipment.created'))}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label={t('shipment.warehouseLabel')} name="warehouse" rules={[{ required: true }]}>
                <Select placeholder={t('shipment.selectWarehouse')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={t('shipment.truckLabel')} name="truck" rules={[{ required: true }]}>
                <Input placeholder="B 1234 AB" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />} size="large">
                {t('shipment.submitBtn')}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }

  return (
    <Card bordered={false} style={{ borderRadius: '8px' }}>
      <Table 
        columns={columns} 
        dataSource={data} 
        loading={loading}
        pagination={{
          current: currentPage,
          total: total,
          pageSize: pageSize,
          onChange: (page) => setCurrentPage(page),
        }} 
        rowKey="id" 
      />
    </Card>
  );
}