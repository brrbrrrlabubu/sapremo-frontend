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
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const { t } = useTranslation();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ProductService.getProducts(1, 100);
      setProducts(res.results);
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
    let total = products.length;
    let normalCount = 0;
    let lowCount = 0;
    let criticalCount = 0;

    const data = products.map((p: any, idx) => {
      const qty = p.qty || 0;
      const min_qty = p.min_qty || 20; // fallback norm
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
        name: p.product_name,
        quantity: qty,
        norm: min_qty,
        location: t('analytics.warehouse'), // not in schema usually
        status: status,
      };
    });

    const calculatedKpis = [
      { title: t('analytics.totalPositions'), value: total.toString() },
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
  }, [products]);

  const columns = [
    { 
      title: t('analytics.barcodeCol'), 
      dataIndex: 'barcode', 
      key: 'barcode',
      render: (text: string) => <Text type="secondary">{text}</Text>
    },
    { title: t('analytics.productCol'), dataIndex: 'name', key: 'name' },
    { 
      title: t('analytics.stockCol'), 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (val: number, record: any) => (
        <span style={{ color: record.status === t('statuses.critical') || record.status === t('statuses.low') ? PALETTE.error : 'inherit', fontWeight: 600 }}>
          {val} {t('common.boxes')}
        </span>
      )
    },
    { 
      title: t('analytics.normCol'), 
      dataIndex: 'norm', 
      key: 'norm',
      render: (val: number) => <Text type="secondary">{val} {t('common.boxes')}</Text>
    },
    { 
      title: t('analytics.fillCol'), 
      key: 'fill',
      render: (_: any, record: any) => {
        const percent = Math.min(100, Math.round((record.quantity / record.norm) * 50)); // Scale for visual
        let color = '#52c41a';
        if (record.status === t('statuses.low')) color = '#faad14';
        if (record.status === t('statuses.critical')) color = '#ff4d4f';
        
        return (
          <div style={{ width: 100, height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: 3 }} />
          </div>
        );
      }
    },
    { title: t('analytics.locationCol'), dataIndex: 'location', key: 'location' },
    { 
      title: t('analytics.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        if (status === t('statuses.normal')) {
          return <Tag color="success" style={{ borderRadius: '4px', padding: '2px 8px' }}>{status}</Tag>;
        } else if (status === t('statuses.critical')) {
          return <Tag color="error" style={{ borderRadius: '4px', padding: '2px 8px' }}>{status}</Tag>;
        } else if (status === t('statuses.low')) {
          return <Tag color="warning" style={{ borderRadius: '4px', padding: '2px 8px' }}>{status}</Tag>;
        }
        return <Tag style={{ borderRadius: '4px', padding: '2px 8px' }}>{status}</Tag>;
      }
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>{label}</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {payload.map((p: any, index: number) => (
              <Text key={index} style={{ color: p.fill }}>{p.name} : {p.value}</Text>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Row gutter={[16, 16]}>
        {kpis.map((item, index) => (
          <Col xs={12} md={6} key={index}>
            <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
              <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>{item.title}</Text>
              <div style={{ color: item.color || 'inherit', fontSize: "28px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                {item.icon}
                {item.value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)", padding: '24px 0' }}>
        <div style={{ height: 300, width: '100%', padding: '0 24px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8c8c8c' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8c8c8c' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Legend iconType="square" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey={t('analytics.chartStock')} fill="#1890ff" radius={[4, 4, 0, 0]} maxBarSize={50} />
              <Bar dataKey={t('analytics.chartMinimum')} fill="#ffc069" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={dataSource} 
          loading={loading}
          pagination={false} 
          rowKey="id" 
          style={{ padding: "24px" }}
        />
      </Card>
    </div>
  );
}