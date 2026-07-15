import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Table, Tag, Button, Select, Modal, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  InboxOutlined, 
  FallOutlined,
  WalletOutlined,
  BankOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { PALETTE } from '../theme/tokens';
import { StatsService } from '../services/stats.service';

const { Text, Title } = Typography;

export default function DashboardPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [kpiData, setKpiData] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpis, products] = await Promise.all([
        StatsService.getKpis(),
        StatsService.getTopProducts()
      ]);
      if (kpis) setKpiData(kpis);
      if (products && Array.isArray(products)) {
        setTopProducts(products.map((p: any, i: number) => ({
          id: p.id || i + 1,
          name: p.name || p.product_name,
          sold: p.sold || p.qty,
          total: `${p.total || 0} сом`
        })));
      }
    } catch (e) {
      console.error(e);
      message.error(t('dashboard.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    { title: t('dashboard.stock'), value: kpiData?.total_stock || "0", suffix: ` ${t('dashboard.unit')}`, icon: <InboxOutlined style={{ color: PALETTE.primary }} />, iconBg: "rgba(59, 130, 246, 0.15)" },
    { title: t('dashboard.driverDebt'), value: kpiData?.driver_debt || "0", suffix: ` ${t('common.som')}`, icon: <FallOutlined style={{ color: PALETTE.error }} />, iconBg: "rgba(239, 68, 68, 0.15)" },
    { title: t('dashboard.cashbox'), value: kpiData?.cashbox || "0", suffix: ` ${t('common.som')}`, icon: <WalletOutlined style={{ color: PALETTE.success }} />, iconBg: "rgba(16, 185, 129, 0.15)" },
    { title: t('dashboard.factoryDebt'), value: kpiData?.factory_debt || "0", suffix: ` ${t('common.som')}`, icon: <BankOutlined style={{ color: "#d48806" }} />, iconBg: "rgba(245, 158, 11, 0.15)" },
  ];

  const recentRequests = [
    { id: 1, date: "16.06.2026", driver: "Саматов Тимур", amount: "15 000 сом", status: t('statuses.issued'), statusColor: "success" },
    { id: 2, date: "16.06.2026", driver: "Саматов Тимур", amount: "15 000 сом", status: t('statuses.pending'), statusColor: "warning" },
    { id: 3, date: "16.06.2026", driver: "Саматов Тимур", amount: "15 000 сом", status: t('statuses.rejected'), statusColor: "error" },
    { id: 4, date: "16.06.2026", driver: "Саматов Тимур", amount: "15 000 сом", status: t('statuses.confirmed'), statusColor: "processing" },
  ];



  const topDrivers = [
    { id: 1, driver: "Саматов Тимур", car: "MH 1234 KG", sold: "1 280", total: "55,800 сом" },
    { id: 2, driver: "Саматов Тимур", car: "MH 1234 KG", sold: "1 280", total: "55,800 сом" },
    { id: 3, driver: "Саматов Тимур", car: "MH 1234 KG", sold: "1 280", total: "55,800 сом" },
    { id: 4, driver: "Саматов Тимур", car: "MH 1234 KG", sold: "1 280", total: "55,800 сом" },
    { id: 5, driver: "Саматов Тимур", car: "MH 1234 KG", sold: "1 280", total: "55,800 сом" },
  ];

  const recentCols = [
    { title: t('dashboard.dateCol'), dataIndex: 'date', key: 'date' },
    { title: t('dashboard.driverCol'), dataIndex: 'driver', key: 'driver' },
    { title: t('dashboard.amountCol'), dataIndex: 'amount', key: 'amount', render: (text: string) => <strong>{text}</strong> },
    { title: t('dashboard.statusCol'), dataIndex: 'status', key: 'status', render: (status: string, record: any) => <Tag color={record.statusColor} style={{ borderRadius: "12px", padding: "2px 10px" }}>{status}</Tag> },
    { title: t('dashboard.actionsCol'), key: 'action', render: () => <Button icon={<EyeOutlined />} size="small" style={{ borderRadius: "6px" }} onClick={() => setIsModalOpen(true)}>{t('common.view')}</Button> },
  ];

  const topProductsCols = [
    { title: '#', dataIndex: 'id', key: 'id' },
    { title: t('dashboard.productCol'), dataIndex: 'name', key: 'name' },
    { title: t('dashboard.soldCol'), dataIndex: 'sold', key: 'sold' },
    { title: t('dashboard.salesCol'), dataIndex: 'total', key: 'total', render: (text: string) => <span style={{ color: PALETTE.primary, fontWeight: 500 }}>{text}</span> },
  ];

  const topDriversCols = [
    { title: t('dashboard.driverCol'), dataIndex: 'driver', key: 'driver' },
    { title: t('dashboard.carCol'), dataIndex: 'car', key: 'car', render: (text: string) => <span style={{ background: "var(--color-bg-layout, #f0f0f0)", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", border: "1px solid var(--color-border, #e8e8e8)", color: "var(--color-text-secondary, #8c8c8c)" }}>{text}</span> },
    { title: t('dashboard.soldCol'), dataIndex: 'sold', key: 'sold' },
    { title: t('dashboard.salesCol'), dataIndex: 'total', key: 'total', render: (text: string) => <span style={{ color: PALETTE.success, fontWeight: 500 }}>{text}</span> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Row gutter={[16, 16]}>
        {kpis.map((kpi, index) => (
          <Col xs={24} sm={12} xl={6} key={index}>
            <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: "13px" }}>{kpi.title}</Text>
                  <div style={{ marginTop: "8px", display: "flex", alignItems: "baseline" }}>
                    <span style={{ fontSize: "24px", fontWeight: "bold" }}>{kpi.value}</span>
                    <span style={{ fontSize: "12px", marginLeft: "4px", color: "#8c8c8c" }}>{kpi.suffix}</span>
                  </div>
                </div>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: kpi.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                  {kpi.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card 
        title={<span style={{ fontSize: "18px", fontWeight: 600 }}>{t('dashboard.recentRequests')}</span>} 
        extra={<Button style={{ borderRadius: "6px" }}>{t('dashboard.allRequests')}</Button>} 
        bordered={false} 
        style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
        styles={{ body: { padding: 0 } }}
      >
        <Table columns={recentCols} dataSource={recentRequests} pagination={false} rowKey="id" style={{ padding: "0 24px 24px 24px" }} />
      </Card>

      <Card 
        title={<span style={{ fontSize: "18px", fontWeight: 600 }}>{t('dashboard.topProducts')}</span>} 
        extra={<Select defaultValue="top5" style={{ width: 100, borderRadius: "6px" }} options={[{ value: 'top5', label: t('dashboard.top5') }, { value: 'top10', label: t('dashboard.top10') }]} />}
        bordered={false} 
        style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
        styles={{ body: { padding: 0 } }}
      >
        <Table columns={topProductsCols} dataSource={topProducts} loading={loading} pagination={false} rowKey="id" style={{ padding: "0 24px 24px 24px" }} />
      </Card>

      <Card 
        title={<span style={{ fontSize: "18px", fontWeight: 600 }}>{t('dashboard.topDrivers')}</span>} 
        bordered={false} 
        style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
        styles={{ body: { padding: 0 } }}
      >
        <Table columns={topDriversCols} dataSource={topDrivers} pagination={false} rowKey="id" style={{ padding: "0 24px 24px 24px" }} />
      </Card>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        footer={[
          <Button key="issue" style={{ color: PALETTE.success, background: 'rgba(82, 196, 26, 0.15)', borderColor: 'transparent', borderRadius: '6px' }} onClick={() => setIsModalOpen(false)}>
            {t('statuses.issued')}
          </Button>
        ]}
        title={
          <div style={{ paddingRight: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={3} style={{ margin: 0, fontSize: '24px' }}>Саматов Тимур</Title>
                <div style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginTop: 8, fontSize: '14px' }}>
                  MH 1234 KG · +996 700 111 222
                </div>
                <div style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginTop: 4, fontSize: '14px' }}>
                  {t('dashboard.requestDate')} 20.06.2026
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: PALETTE.success, fontWeight: 500, fontSize: '14px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: PALETTE.success }} />
                {t('statuses.issued')}
              </div>
            </div>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32, marginBottom: 32, fontSize: '14px' }}>
          <div>
            <span style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginRight: 8 }}>{t('dashboard.modalDriver')}</span>
            <span>Саматов Тимур</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginRight: 8 }}>{t('dashboard.modalCar')}</span>
            <span style={{ background: 'var(--color-bg-layout, #f5f5f5)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-border, #e8e8e8)', color: 'var(--color-text-secondary, #595959)' }}>MH 1234 KG</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginRight: 8 }}>{t('dashboard.modalDate')}</span>
            <span>20.06.2026</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginRight: 8 }}>{t('dashboard.modalTotal')}</span>
            <span style={{ fontWeight: 600 }}>15 000 сом</span>
          </div>
        </div>

        <Title level={5} style={{ marginBottom: 16, fontSize: '16px' }}>{t('dashboard.requestedGoods')}</Title>
        <Table
          pagination={false}
          size="middle"
          columns={[
            { title: t('common.product'), dataIndex: 'name', key: 'name' },
            { title: t('common.quantity'), dataIndex: 'qty', key: 'qty' },
            { title: t('dashboard.priceCol'), dataIndex: 'price', key: 'price' },
            { title: t('dashboard.totalCol'), dataIndex: 'total', key: 'total', render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span> }
          ]}
          dataSource={[
            { id: 1, name: "Пломбир «Сливочный» 80г", qty: 10, price: "42 сом", total: "4 200 сом" },
            { id: 2, name: "Эскимо в шоколаде", qty: 5, price: "60 сом", total: "3 000 сом" },
            { id: 3, name: "Рожок фисташковый", qty: 4, price: "78 сом", total: "3 120 сом" },
          ]}
          rowKey="id"
          summary={() => (
            <Table.Summary.Row style={{ background: 'var(--color-bg-layout, #fafafa)' }}>
              <Table.Summary.Cell index={0}><span style={{ fontWeight: 600 }}>{t('dashboard.total')}</span></Table.Summary.Cell>
              <Table.Summary.Cell index={1}></Table.Summary.Cell>
              <Table.Summary.Cell index={2}></Table.Summary.Cell>
              <Table.Summary.Cell index={3}><span style={{ color: PALETTE.primary, fontWeight: 600 }}>10 320 сом</span></Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </Modal>
    </div>
  );
}