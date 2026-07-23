import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, Table, Tag, Button, Select, Pagination, Typography, App,
} from 'antd';
import {
  ExclamationCircleFilled,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import emptyIllustration from '../assets/Empty Products Illustration.png';
import { ProductService } from '../services/product.service';
import { MobileCard, MobileCardList } from '../components/MobileCard';
import { useResponsiveTable } from '../hooks/useResponsiveTable';
import type { Product } from '../types/api.types';

const { Title, Text } = Typography;

type AppState = 'loading' | 'empty' | 'error' | 'success';

// Статусы продуктов — маппинг API-значения → отображение
function getProductStatusConfig(status: string): { color: string; label: string } {
  const s = status?.toLowerCase() ?? '';
  if (s === 'active' || s === 'норма')
    return { color: 'success', label: 'Активен' };
  if (s === 'inactive' || s === 'неактивен')
    return { color: 'default', label: 'Неактивен' };
  if (s === 'low_stock' || s === 'низкий')
    return { color: 'warning', label: 'Мало' };
  if (s === 'no_stock' || s === 'критический')
    return { color: 'error', label: 'Нет' };
  return { color: 'default', label: status || '—' };
}

export default function WarehousePage() {
  const { t } = useTranslation();
  const [appState, setAppState] = useState<AppState>('loading');
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { message } = App.useApp();
  const { isMobile, tableScroll } = useResponsiveTable(800);

  const loadData = useCallback(
    async (page: number) => {
      setAppState('loading');
      try {
        const res = await ProductService.getProducts(page, pageSize);
        setProducts(res.results);
        setTotal(res.count);
        setAppState(res.results.length > 0 ? 'success' : 'empty');
      } catch (error) {
        console.error('[WarehousePage] loadData:', error);
        setAppState('error');
        message.error(t('warehouse.errorLoading'));
      }
    },
    [message, t]
  );

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, loadData]);

  const columns = [
    {
      title: t('warehouse.barcodeCol'),
      dataIndex: 'barcode',
      key: 'barcode',
      width: 130,
    },
    {
      title: t('warehouse.productCol'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('warehouse.inBoxCol'),
      dataIndex: 'pieces_per_box',
      key: 'pieces_per_box',
      width: 100,
      render: (text: number) => `${text} шт.`,
    },
    {
      title: t('warehouse.factoryPriceCol'),
      dataIndex: 'factory_price',
      key: 'factory_price',
      width: 120,
      render: (val: string) => `${val} с`,
    },
    {
      title: t('warehouse.dispatchPriceCol'),
      dataIndex: 'dispatch_price',
      key: 'dispatch_price',
      width: 120,
      render: (val: string) => `${val} с`,
    },
    {
      title: t('warehouse.statusCol'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const cfg = getProductStatusConfig(status);
        return (
          <Tag color={cfg.color} style={{ borderRadius: '4px', padding: '2px 8px' }}>
            {cfg.label}
          </Tag>
        );
      },
    },
  ];

  // ── Состояния error / empty ───────────────────────────────────────────────
  if (appState === 'error') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card style={{ width: 400, textAlign: 'center', borderRadius: '12px', padding: '32px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 96, height: 96, margin: '0 auto', background: '#fff2f0', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <ExclamationCircleFilled style={{ fontSize: 32, color: '#ff4d4f' }} />
          </div>
          <Title level={4} style={{ marginBottom: 12 }}>{t('warehouse.errorTitle')}</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>{t('warehouse.errorDesc')}</Text>
          <Button type="primary" icon={<ReloadOutlined />} size="large" style={{ borderRadius: '6px' }} onClick={() => loadData(currentPage)}>
            {t('warehouse.retry')}
          </Button>
        </Card>
      </div>
    );
  }

  if (appState === 'empty') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card style={{ width: 400, textAlign: 'center', borderRadius: '12px', padding: '32px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <img src={emptyIllustration} alt="Empty" style={{ width: 140, marginBottom: 24 }} />
          <Title level={4} style={{ marginBottom: 12 }}>{t('warehouse.emptyTitle')}</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>{t('warehouse.emptyDesc')}</Text>
          <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: '6px' }} onClick={() => loadData(currentPage)}>
            {t('common.refresh')}
          </Button>
        </Card>
      </div>
    );
  }

  // ── Мобильные карточки ────────────────────────────────────────────────────
  const renderMobileCard = (p: Product) => {
    const cfg = getProductStatusConfig(p.status);
    return (
      <MobileCard
        key={p.id}
        fields={[
          { label: t('warehouse.productCol'), value: p.name, isPrimary: true },
          { label: t('warehouse.barcodeCol'), value: p.barcode },
          { label: t('warehouse.inBoxCol'), value: `${p.pieces_per_box} шт.` },
          { label: t('warehouse.factoryPriceCol'), value: `${p.factory_price} с` },
          { label: t('warehouse.dispatchPriceCol'), value: `${p.dispatch_price} с` },
          { label: t('warehouse.statusCol'), value: cfg.label, tagColor: cfg.color },
        ]}
      />
    );
  };

  // ── Скелетон загрузки ─────────────────────────────────────────────────────
  const loadingSkeleton = (
    <div style={{ minHeight: 400, display: 'flex', flexDirection: 'column', padding: 24, gap: 16 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, height: 16, background: '#f0f0f0', borderRadius: 4 }} />
          <div style={{ width: 120, height: 16, background: '#f0f0f0', borderRadius: 4 }} />
          <div style={{ width: 80, height: 16, background: '#f0f0f0', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 700 }}>
            {appState === 'loading' ? t('warehouse.titleLoading') : t('warehouse.title')}
          </Title>
          {appState === 'loading' && (
            <Text type="secondary">{t('warehouse.subtitle')}</Text>
          )}
        </div>
        <Select
          defaultValue="all"
          style={{ width: 120, height: 40 }}
          options={[{ value: 'all', label: t('common.all') }]}
        />
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: 0 } }}
      >
        {appState === 'loading' ? (
          loadingSkeleton
        ) : isMobile ? (
          <>
            <MobileCardList
              data={products}
              renderCard={renderMobileCard}
              emptyText={t('common.noData', 'Нет данных')}
            />
            <div style={{ padding: '8px 16px 16px', display: 'flex', justifyContent: 'center' }}>
              <Select
                value={currentPage}
                onChange={setCurrentPage}
                style={{ width: 120 }}
                options={Array.from({ length: Math.ceil(total / pageSize) || 1 }, (_, i) => ({
                  value: i + 1,
                  label: `Стр. ${i + 1}`,
                }))}
              />
            </div>
          </>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={products}
              pagination={false}
              rowKey="id"
              scroll={tableScroll}
              style={{ padding: '0 24px' }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 24px',
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Text type="secondary">
                Показано {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, total)} из {total.toLocaleString()}
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