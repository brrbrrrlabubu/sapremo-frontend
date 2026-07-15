import { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Select, DatePicker, Menu, Layout, Space, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  PrinterOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { PALETTE } from '../theme/tokens';
import { ProductService } from '../services/product.service';


const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Sider, Content } = Layout;

export default function ReportsPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [selectedMenu, setSelectedMenu] = useState(['remains']);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = async (page: number) => {
    setLoading(true);
    try {
      const res = await ProductService.getProducts(page, pageSize);
      setTotal(res.count);
      
      const mapped = res.results.map((p: any, idx) => {
        const qty = p.qty || 0;
        const minQty = p.min_qty || 20;
        let status = t('statuses.normal');
        if (qty === 0 || qty < minQty * 0.3) status = t('statuses.critical');
        else if (qty < minQty) status = t('statuses.low');

        return {
          id: p.id || idx,
          sku: p.barcode || "—",
          name: p.product_name,
          category: "—",
          initial: "—",
          income: "—",
          expense: "—",
          current: `${qty} ${t('common.boxes')}`,
          status,
        };
      });
      setProducts(mapped);
    } catch (err) {
      console.error(err);
      message.error(t('reports.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

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
          <span style={{ width: 6, height: 6, backgroundColor: '#cf1322', borderRadius: '50%' }} />
        </div>
      ) 
    },
  ];



  const columns = [
    { 
      title: t('reports.skuCol'), 
      dataIndex: 'sku', 
      key: 'sku',
      render: (text: string) => <Text type="secondary" style={{ fontFamily: 'monospace' }}>{text}</Text>
    },
    { 
      title: t('reports.nameCol'), 
      dataIndex: 'name', 
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    { title: t('reports.categoryCol'), dataIndex: 'category', key: 'category' },
    { title: t('reports.initialCol'), dataIndex: 'initial', key: 'initial' },
    { 
      title: t('reports.incomeCol'), 
      dataIndex: 'income', 
      key: 'income',
      render: (text: string) => <span style={{ color: PALETTE.success }}>{text}</span>
    },
    { 
      title: t('reports.expenseCol'), 
      dataIndex: 'expense', 
      key: 'expense',
      render: (text: string) => <span style={{ color: PALETTE.error }}>{text}</span>
    },
    { 
      title: t('reports.currentCol'), 
      dataIndex: 'current', 
      key: 'current',
      render: (text: string) => <Text strong>{text}</Text>
    },
    { 
      title: t('reports.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        if (status === t('statuses.normal') || status === 'Норма') {
          return <Tag color="success" style={{ borderRadius: '4px', padding: '2px 8px' }}>{status}</Tag>;
        } else if (status === t('statuses.critical') || status === 'Критический') {
          return <Tag color="error" style={{ borderRadius: '4px', padding: '2px 8px' }}>{status}</Tag>;
        }
        return (
          <Tag color="warning" style={{ borderRadius: '4px', padding: '2px 8px' }}>
            {status}
          </Tag>
        );
      }
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>{t('reports.title')}</Title>
        <Space>
          <Button icon={<PrinterOutlined />} style={{ borderRadius: '6px' }}>{t('reports.print')}</Button>
          <Button type="primary" icon={<DownloadOutlined />} style={{ borderRadius: '6px' }}>{t('reports.exportExcel')}</Button>
        </Space>
      </div>

      <Layout style={{ background: 'transparent', flex: 1, display: 'flex', gap: '24px', flexDirection: 'row' }}>
        <Sider width={250} style={{ background: 'var(--color-bg-container, #ffffff)', borderRadius: '8px', overflow: 'hidden', boxShadow: "0 1px 2px rgba(0,0,0,0.03)", height: 'fit-content' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border, #f0f0f0)', fontWeight: 600, color: 'var(--color-text-secondary, #8c8c8c)', textTransform: 'uppercase', fontSize: '12px' }}>
            {t('reports.reportTypes')}
          </div>
          <Menu
            mode="inline"
            selectedKeys={selectedMenu}
            onSelect={(e) => setSelectedMenu(e.selectedKeys)}
            items={menuItems}
            style={{ borderRight: 'none', padding: '8px' }}
          />
        </Sider>

        <Content style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end' }}>
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>{t('reports.period')}</Text>
                <RangePicker style={{ borderRadius: '6px' }} />
              </div>
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>{t('reports.warehouseFilter')}</Text>
                <Select defaultValue="main" style={{ width: 200, borderRadius: '6px' }}>
                  <Select.Option value="main">{t('reports.mainCold')}</Select.Option>
                  <Select.Option value="warm">{t('reports.warmWarehouse')}</Select.Option>
                </Select>
              </div>
              <Button type="primary" style={{ borderRadius: '6px', background: '#d9d9d9', borderColor: '#d9d9d9', color: 'black' }}>{t('common.apply')}</Button>
            </div>
          </Card>

          <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} styles={{ body: { padding: 0 } }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border, #f0f0f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={5} style={{ margin: 0 }}>{t('reports.reportTitle')}</Title>
              <Text type="secondary">{t('reports.totalRecords', { count: total.toLocaleString() })}</Text>
            </div>
            <Table 
              columns={columns} 
              dataSource={products} 
              loading={loading}
              pagination={{
                current: currentPage,
                total: total,
                pageSize: pageSize,
                showSizeChanger: false,
                onChange: (page) => setCurrentPage(page),
                showTotal: (total, range) => t('common.shown', { from: range[0], to: range[1], total: total.toLocaleString() })
              }} 
              rowKey="id" 
              style={{ padding: "0 24px 24px 24px" }}
            />
          </Card>
        </Content>
      </Layout>
    </div>
  );
}