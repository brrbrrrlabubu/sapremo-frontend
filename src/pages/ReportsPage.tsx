import { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Select, DatePicker, Menu, Layout, Space, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
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
      
      const mapped = res.results.map((p: any, idx: number) => {
        const qty = p.qty || 0;
        const minQty = p.min_qty || 20;
        let status = t('statuses.normal');
        if (qty === 0 || qty < minQty * 0.3) status = t('statuses.critical');
        else if (qty < minQty) status = t('statuses.low');

        return {
          id: p.id || idx,
          sku: p.barcode || "—",
          name: p.product_name || "—",
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
    { key: 'low_stock', label: t('reports.lowStockReport') },
  ];

  const columns = [
    { title: t('reports.skuCol'), dataIndex: 'sku', key: 'sku' },
    { title: t('reports.nameCol'), dataIndex: 'name', key: 'name', render: (text: string) => <Text strong>{text}</Text> },
    { title: t('reports.categoryCol'), dataIndex: 'category', key: 'category' },
    { title: t('reports.currentCol'), dataIndex: 'current', key: 'current' },
    { 
      title: t('reports.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === t('statuses.normal') ? 'success' : 'error'} style={{ borderRadius: '4px' }}>
          {status}
        </Tag>
      )
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0, fontSize: "28px" }}>{t('reports.title')}</Title>
        <Space>
          <Button icon={<PrinterOutlined />}>{t('reports.print')}</Button>
          <Button type="primary" icon={<DownloadOutlined />}>{t('reports.exportExcel')}</Button>
        </Space>
      </div>

      <Layout style={{ background: 'transparent', display: 'flex', flexDirection: 'row', gap: '24px' }}>
        <Sider width={250} style={{ background: '#ffffff', borderRadius: '8px', height: 'fit-content' }}>
          <Menu
            mode="inline"
            selectedKeys={selectedMenu}
            onSelect={(e) => setSelectedMenu(e.selectedKeys)}
            items={menuItems}
          />
        </Sider>

        <Content style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <RangePicker />
              <Select defaultValue="main" style={{ width: 200 }} />
              <Button type="primary">{t('common.apply')}</Button>
            </div>
          </Card>

          <Card bordered={false} style={{ borderRadius: '8px' }}>
            <Table 
              columns={columns} 
              dataSource={products} 
              loading={loading}
              pagination={{
                current: currentPage,
                total: total,
                pageSize: pageSize,
                onChange: (page) => setCurrentPage(page)
              }} 
              rowKey="id" 
            />
          </Card>
        </Content>
      </Layout>
    </div>
  );
}