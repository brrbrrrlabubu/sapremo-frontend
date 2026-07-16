import { useState, useEffect, useMemo } from 'react';
import { Card, Typography, Row, Col, Table, Tag, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { WarningOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PALETTE } from '../theme/tokens';
import { ProductService } from '../services/product.service';

const { Text } = Typography;

export default function AnalyticsPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ProductService.getProducts(1, 100);
      setProducts(res.results || []);
    } catch (err) {
      console.error(err);
      message.error(t('analytics.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const { kpis, chartData, dataSource } = useMemo(() => {
    let normalCount = 0;
    let lowCount = 0;
    let criticalCount = 0;

    const data = products.map((p: any, idx: number) => {
      const qty = p.qty || 0;
      const min_qty = p.min_qty || 20;
      let status = t('statuses.normal');
      
      if (qty === 0 || qty < min_qty * 0.3) {
        status = t('statuses.critical');
        criticalCount++;
      } else if (qty < min_qty) {
        status = t('statuses.low');
        lowCount++;
      } else {
        normalCount++;
      }
      
      return {
        id: p.id || idx,
        barcode: p.barcode || "—",
        name: p.product_name || "—",
        quantity: qty,
        norm: min_qty,
        location: t('analytics.warehouse'),
        status: status,
      };
    });

    const calculatedKpis = [
      { title: t('analytics.totalPositions'), value: products.length.toString() },
      { title: t('analytics.normal'), value: normalCount.toString(), color: PALETTE.success },
      { title: t('analytics.lowStock'), value: lowCount.toString(), color: '#faad14' },
      { title: t('analytics.critical'), value: criticalCount.toString(), color: PALETTE.error, icon: <WarningOutlined /> },
    ];

    const chart = data.slice(0, 10).map(d => ({
      name: d.name,
      [t('analytics.chartStock')]: d.quantity,
      [t('analytics.chartMinimum')]: d.norm,
    }));

    return { kpis: calculatedKpis, chartData: chart, dataSource: data };
  }, [products, t]);

  const columns = [
    { title: t('analytics.barcodeCol'), dataIndex: 'barcode', key: 'barcode', render: (text: string) => <Text type="secondary">{text}</Text> },
    { title: t('analytics.productCol'), dataIndex: 'name', key: 'name' },
    { title: t('analytics.stockCol'), dataIndex: 'quantity', key: 'quantity', render: (val: number, _: any) => <span style={{ fontWeight: 600 }}>{val}</span> },
    { title: t('analytics.statusCol'), dataIndex: 'status', key: 'status', render: (status: string) => <Tag>{status}</Tag> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Row gutter={[16, 16]}>
        {kpis.map((item, index) => (
          <Col xs={12} md={6} key={index}>
            <Card bordered={false}>
              <Text type="secondary">{item.title}</Text>
              <div style={{ color: item.color, fontSize: "28px", fontWeight: 700 }}>{item.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={t('analytics.chartStock')} fill="#1890ff" />
              <Bar dataKey={t('analytics.chartMinimum')} fill="#ffc069" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card bordered={false} styles={{ body: { padding: 0 } }}>
        <Table columns={columns} dataSource={dataSource} loading={loading} pagination={false} rowKey="id" />
      </Card>
    </div>
  );
}