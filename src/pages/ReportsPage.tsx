import { useState, useEffect, useCallback } from 'react';
import {
  Card, Typography, Table, Tag, Button, Select, DatePicker,
  Menu, Layout, Space, App,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { PALETTE } from '../theme/tokens';
import { ProductService } from '../services/product.service';
import { MobileCard, MobileCardList } from '../components/MobileCard';
import { useResponsiveTable } from '../hooks/useResponsiveTable';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Content } = Layout;

// ─── Типы ─────────────────────────────────────────────────────────────────────
interface ReportRow {
  id: string | number;
  sku: string;
  name: string;
  category: string;
  initial: string;
  income: string;
  expense: string;
  current: string;
  status: string;
}

const REPORT_MENU_KEYS = [
  'remains', 'movement', 'debts', 'cash',
  'shipment', 'returns', 'factory_debts', 'low_stock',
] as const;
type ReportKey = typeof REPORT_MENU_KEYS[number];

export default function ReportsPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const { isMobile, tableScroll } = useResponsiveTable(900);

  const [selectedReport, setSelectedReport] = useState<ReportKey>('remains');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const res = await ProductService.getProducts(page, pageSize);
        setTotal(res.count);

        const mapped: ReportRow[] = res.results.map((p, idx) => {
          const qty = (p as any).qty ?? 0;
          const minQty = (p as any).min_qty ?? 20;
          let status = t('statuses.normal');
          if (qty === 0 || qty < minQty * 0.3) status = t('statuses.critical');
          else if (qty < minQty) status = t('statuses.low');

          return {
            id: p.id ?? idx,
            sku: p.barcode ?? '—',
            name: (p as any).product_name ?? p.name,
            category: '—',
            initial: '—',
            income: '—',
            expense: '—',
            current: `${qty} ${t('common.boxes')}`,
            status,
          };
        });
        setProducts(mapped);
      } catch (err) {
        console.error('[ReportsPage] loadData:', err);
        message.error(t('reports.errorLoading'));
      } finally {
        setLoading(false);
      }
    },
    [message, t]
  );

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, loadData]);

  // Перезагружаем при смене типа отчёта (в будущем — другой endpoint)
  useEffect(() => {
    loadData(1);
    setCurrentPage(1);
  }, [selectedReport]); // eslint-disable-line react-hooks/exhaustive-deps

  const menuItems = [
    { key: 'remains', label: t('reports.remains') },
    { key: 'movement', label: t('reports.movement') },
    { key: 'debts', label: t('reports.debts') },
    { key: 'cash', label: t('reports.cash') },
    { key: 'shipment', label: t('reports.shipmentReport') },
    { key: 'returns', label: t('reports.returnsReport') },
    { key: 'factory_debts', label: t('reports.factoryDebts') },
    {
      key: 'low_stock',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {t('reports.lowStockReport')}
          <span style={{ width: 6, height: 6, backgroundColor: '#cf1322', borderRadius: '50%', flexShrink: 0 }} />
        </div>
      ),
    },
  ];

  const columns = [
    {
      title: t('reports.skuCol'),
      dataIndex: 'sku',
      key: 'sku',
      width: 130,
      render: (text: string) => (
        <Text type="secondary" style={{ fontFamily: 'monospace' }}>{text}</Text>
      ),
    },
    {
      title: t('reports.nameCol'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    { title: t('reports.categoryCol'), dataIndex: 'category', key: 'category', width: 100 },
    { title: t('reports.initialCol'), dataIndex: 'initial', key: 'initial', width: 90 },
    {
      title: t('reports.incomeCol'),
      dataIndex: 'income',
      key: 'income',
      width: 90,
      render: (text: string) => <span style={{ color: PALETTE.success }}>{text}</span>,
    },
    {
      title: t('reports.expenseCol'),
      dataIndex: 'expense',
      key: 'expense',
      width: 90,
      render: (text: string) => <span style={{ color: PALETTE.error }}>{text}</span>,
    },
    {
      title: t('reports.currentCol'),
      dataIndex: 'current',
      key: 'current',
      width: 110,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: t('reports.statusCol'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => {
        const isNormal = status === t('statuses.normal');
        const isCritical = status === t('statuses.critical');
        return (
          <Tag
            color={isNormal ? 'success' : isCritical ? 'error' : 'warning'}
            style={{ borderRadius: '4px', padding: '2px 8px' }}
          >
            {status}
          </Tag>
        );
      },
    },
  ];

  // ── Мобильные карточки ────────────────────────────────────────────────────
  const renderMobileCard = (row: ReportRow) => {
    const isNormal = row.status === t('statuses.normal');
    const isCritical = row.status === t('statuses.critical');
    return (
      <MobileCard
        key={row.id}
        fields={[
          { label: t('reports.nameCol'), value: row.name, isPrimary: true },
          { label: t('reports.skuCol'), value: row.sku },
          { label: t('reports.currentCol'), value: row.current },
          {
            label: t('reports.statusCol'),
            value: row.status,
            tagColor: isNormal ? 'success' : isCritical ? 'error' : 'warning',
          },
        ]}
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Title level={2} style={{ margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 700 }}>
          {t('reports.title')}
        </Title>
        <Space>
          <Button icon={<PrinterOutlined />} style={{ borderRadius: '6px' }}>
            {t('reports.print')}
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} style={{ borderRadius: '6px' }}>
            {t('reports.exportExcel')}
          </Button>
        </Space>
      </div>

      {/* На мобильном — Select вместо Sider */}
      {isMobile && (
        <Select
          value={selectedReport}
          onChange={(v) => setSelectedReport(v as ReportKey)}
          style={{ width: '100%' }}
          options={menuItems.map((item) => ({
            value: item.key,
            label: typeof item.label === 'string' ? item.label : t(`reports.${item.key}`),
          }))}
        />
      )}

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* Десктопный сайдбар */}
        {!isMobile && (
          <Card
            bordered={false}
            style={{ width: 250, flexShrink: 0, borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)', padding: 0 }}
            styles={{ body: { padding: 0 } }}
          >
            <div
              style={{
                padding: '16px',
                borderBottom: '1px solid var(--color-border, #f0f0f0)',
                fontWeight: 600,
                color: 'var(--color-text-secondary, #8c8c8c)',
                textTransform: 'uppercase',
                fontSize: '12px',
              }}
            >
              {t('reports.reportTypes')}
            </div>
            <Menu
              mode="inline"
              selectedKeys={[selectedReport]}
              onSelect={(e) => setSelectedReport(e.key as ReportKey)}
              items={menuItems}
              style={{ borderRight: 'none', padding: '8px' }}
            />
          </Card>
        )}

        {/* Основной контент */}
        <Content style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          {/* Фильтры */}
          <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
            <div
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  {t('reports.period')}
                </Text>
                <RangePicker style={{ borderRadius: '6px' }} />
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  {t('reports.warehouseFilter')}
                </Text>
                <Select
                  defaultValue="main"
                  style={{ width: isMobile ? '100%' : 200, borderRadius: '6px' }}
                >
                  <Select.Option value="main">{t('reports.mainCold')}</Select.Option>
                  <Select.Option value="warm">{t('reports.warmWarehouse')}</Select.Option>
                </Select>
              </div>
              <Button
                type="primary"
                style={{ borderRadius: '6px', background: '#d9d9d9', borderColor: '#d9d9d9', color: 'black' }}
              >
                {t('common.apply')}
              </Button>
            </div>
          </Card>

          {/* Таблица / карточки */}
          <Card
            bordered={false}
            style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
            styles={{ body: { padding: 0 } }}
          >
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--color-border, #f0f0f0)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Title level={5} style={{ margin: 0 }}>{t('reports.reportTitle')}</Title>
              <Text type="secondary">
                {t('reports.totalRecords', { count: total.toLocaleString() })}
              </Text>
            </div>

            {isMobile ? (
              <>
                <MobileCardList
                  data={products}
                  loading={loading}
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
              <Table
                columns={columns}
                dataSource={products}
                loading={loading}
                pagination={{
                  current: currentPage,
                  total,
                  pageSize,
                  showSizeChanger: false,
                  onChange: (page) => setCurrentPage(page),
                  showTotal: (tot, range) =>
                    t('common.shown', { from: range[0], to: range[1], total: tot.toLocaleString() }),
                }}
                rowKey="id"
                scroll={tableScroll}
                style={{ padding: '0 24px 24px' }}
              />
            )}
          </Card>
        </Content>
      </div>
    </div>
  );
}