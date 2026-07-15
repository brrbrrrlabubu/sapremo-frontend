import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Table, Tag, Button, Select, Pagination, Spin, Typography, App } from 'antd';
import { 
  ExclamationCircleFilled,
  ReloadOutlined,
  PlusOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import emptyIllustration from '../assets/Empty Products Illustration.png';

import { ProductService } from '../services/product.service';
import type { Product } from '../types/api.types';

const { Title, Text } = Typography;

export default function WarehousePage() {
  const { t } = useTranslation();
  const [appState, setAppState] = useState<'loading' | 'empty' | 'error' | 'success'>('loading');
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { message } = App.useApp();

  const loadData = async (page: number) => {
    setAppState('loading');
    try {
      const res = await ProductService.getProducts(page, pageSize);
      setProducts(res.results);
      setTotal(res.count);
      setAppState(res.results.length > 0 ? 'success' : 'empty');
    } catch (error) {
      console.error(error);
      setAppState('error');
      message.error(t('warehouse.errorLoading'));
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const columns = [
    { title: t('warehouse.barcodeCol'), dataIndex: 'barcode', key: 'barcode' },
    { title: t('warehouse.productCol'), dataIndex: 'name', key: 'name' },
    { 
      title: t('warehouse.inBoxCol'), 
      dataIndex: 'pieces_per_box', 
      key: 'pieces_per_box', 
      render: (text: number) => `${text} шт.` 
    },
    { title: t('warehouse.factoryPriceCol'), dataIndex: 'factory_price', key: 'factory_price', render: (val: string) => `${val} с` },
    { title: t('warehouse.dispatchPriceCol'), dataIndex: 'dispatch_price', key: 'dispatch_price', render: (val: string) => `${val} с` },
    { 
      title: t('warehouse.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const s = status?.toLowerCase() || '';
        let color = 'default';
        let label = status || t('statuses.unknown');

        if (s === 'active' || s === 'норма') {
          color = 'success';
          label = t('statuses.active');
        } else if (s === 'inactive' || s === 'неактивен') {
          color = 'default';
          label = t('statuses.inactive');
        } else if (s === 'low_stock' || s === 'низкий') {
          color = 'warning';
          label = t('statuses.low_stock');
        } else if (s === 'no_stock' || s === 'критический') {
          color = 'error';
          label = t('statuses.no_stock');
        }

        return <Tag color={color} style={{ borderRadius: '4px', padding: '2px 8px' }}>{label}</Tag>;
      }
    },
  ];

  // Helper renderers for states
  if (appState === 'error') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card style={{ width: 400, textAlign: 'center', borderRadius: '12px', padding: '32px 16px', boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ width: 96, height: 96, margin: '0 auto', background: '#fff2f0', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <ExclamationCircleFilled style={{ fontSize: 32, color: '#ff4d4f' }} />
          </div>
          <Title level={4} style={{ marginBottom: 12 }}>{t('warehouse.errorTitle')}</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>{t('warehouse.errorDesc')}</Text>
          <Button type="primary" icon={<ReloadOutlined />} size="large" style={{ borderRadius: '6px' }} onClick={() => loadData(currentPage)}>{t('warehouse.retry')}</Button>
        </Card>
      </div>
    );
  }

  if (appState === 'empty') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card style={{ width: 400, textAlign: 'center', borderRadius: '12px', padding: '32px 16px', boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <img src={emptyIllustration} alt="Empty" style={{ width: 140, marginBottom: 24 }} />
          <Title level={4} style={{ marginBottom: 12 }}>{t('warehouse.emptyTitle')}</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>{t('warehouse.emptyDesc')}</Text>
          <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: '6px' }} onClick={() => loadData(currentPage)}>{t('common.refresh')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>{appState === 'loading' ? t('warehouse.titleLoading') : t('warehouse.title')}</Title>
          {appState === 'loading' && <Text type="secondary">{t('warehouse.subtitle')}</Text>}
        </div>
        <Select defaultValue="all" style={{ width: 120, height: 40 }} options={[{ value: 'all', label: t('common.all') }]} />
      </div>

      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} styles={{ body: { padding: 0 } }}>
        {appState === 'loading' ? (
          <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            {/* Fake table skeleton header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
               <div style={{ width: '150px', height: '24px', background: '#f0f0f0', borderRadius: '4px' }} />
               <div style={{ width: '200px', height: '24px', background: '#f0f0f0', borderRadius: '4px' }} />
               <div style={{ width: '80px', height: '24px', background: '#f0f0f0', borderRadius: '4px' }} />
            </div>
            {/* Skeleton rows */}
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ width: '150px', height: '16px', background: '#f5f5f5', borderRadius: '4px' }} />
                <div style={{ width: '200px', height: '16px', background: '#f5f5f5', borderRadius: '4px' }} />
                <div style={{ width: '80px', height: '16px', background: '#f5f5f5', borderRadius: '4px' }} />
              </div>
            ))}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              <div style={{ marginTop: 8, color: '#8c8c8c' }}>{t('common.loading')}</div>
            </div>
          </div>
        ) : (
          <>
            <Table 
              columns={columns} 
              dataSource={products} 
              pagination={false} 
              rowKey="id" 
              style={{ padding: "0 24px" }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
              <Text type="secondary">
                Показано {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, total)} из {total.toLocaleString()}
              </Text>
              <Pagination 
                current={currentPage} 
                total={total} 
                pageSize={pageSize} 
                showSizeChanger={false} 
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          </>
        )}
      </Card>
      

    </div>
  );
}