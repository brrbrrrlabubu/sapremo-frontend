import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Typography, Table, Tag, Button, Select, Space, App } from 'antd';
import { 
  FilePdfOutlined,
  PrinterOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { PALETTE } from '../theme/tokens';
import { ShipmentService } from '../services/shipment.service';
import type { Shipment } from '../types/api.types';

const { Title } = Typography;

export default function ShipmentPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = async (page: number) => {
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
              product: item.product_id ? `Товар ${item.product_id.slice(0,8)}` : "—",
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
  }, [currentPage]);

  const columns = [
    { title: t('shipment.dateCol'), dataIndex: 'date', key: 'date' },
    { 
      title: t('shipment.requestCol'), 
      dataIndex: 'request', 
      key: 'request',
      render: (text: string) => <a style={{ color: PALETTE.primary }}>{text}</a>
    },
    { 
      title: t('shipment.carCol'), 
      dataIndex: 'car', 
      key: 'car',
      render: (text: string) => (
        <span style={{ background: 'var(--color-bg-layout, #f5f5f5)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: 'var(--color-text-secondary, #595959)', border: '1px solid var(--color-border, #e8e8e8)' }}>
          {text}
        </span>
      )
    },
    { title: t('shipment.productCol'), dataIndex: 'product', key: 'product' },
    { 
      title: t('shipment.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const s = status?.toLowerCase() || '';
        const isShipped = s === 'shipped' || s === 'отгружено';
        const isPending = s === 'pending' || s === 'в ожидании';
        return (
          <Tag color={isShipped ? 'success' : (isPending ? 'warning' : 'processing')} style={{ borderRadius: '4px', padding: '2px 8px' }}>
            {status}
          </Tag>
        );
      }
    },
    { 
      title: t('shipment.actionsCol'), 
      key: 'action',
      render: () => (
        <Space size="small">
          <Button icon={<FilePdfOutlined />} size="small" style={{ borderRadius: '6px' }}>{t('shipment.pdf')}</Button>
          <Button icon={<PrinterOutlined />} size="small" style={{ borderRadius: '6px' }}>{t('shipment.print')}</Button>
          <Button type="primary" icon={<CheckOutlined />} size="small" style={{ borderRadius: '6px' }}>{t('shipment.issue')}</Button>
        </Space>
      )
    },
  ];

  return (
    <>
      <Card 
        bordered={false} 
        style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} 
        styles={{ body: { padding: 0 }, header: { borderBottom: 'none', padding: '16px 24px 0' } }}
        extra={
          <div style={{ display: 'flex', gap: 16 }}>
            <Select placeholder={t('shipment.statusFilter')} style={{ width: 150 }} />
          </div>
        }
      >
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          pagination={{
            current: currentPage,
            total: total,
            pageSize: pageSize,
            showSizeChanger: false,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total, range) => `Показано ${range[0]}-${range[1]} из ${total.toLocaleString()}`
          }} 
          rowKey="id" 
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>
    </>
  );
}