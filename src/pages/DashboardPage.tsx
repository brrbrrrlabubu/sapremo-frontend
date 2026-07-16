import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Table, Tag, Button, Modal, App } from 'antd';
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
import { DriverService } from '../services/driver.service';
import { ProductService } from '../services/product.service';

const { Text, Title } = Typography;

function WarehouseDashboard() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [kpiData, setKpiData] = useState<any>(null);
  
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [topDrivers, setTopDrivers] = useState<any[]>([]);
  const [driverDebtSum, setDriverDebtSum] = useState<number>(0);
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});
  const [driversMap, setDriversMap] = useState<Record<string, string>>({});
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchDriversMap = async () => {
    try {
      const data = await DriverService.getDrivers({ page: 0, size: 100 });
      const map: Record<string, string> = {};
      data.content?.forEach((d: any) => {
        map[d.id] = d.fullName;
      });
      setDriversMap(map);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProductsMap = async () => {
    try {
      const data = await ProductService.getProducts(1, 100);
      const map: Record<string, any> = {};
      data.results.forEach((p: any) => {
        map[p.id] = p;
      });
      setProductsMap(map);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      fetchProductsMap();
      fetchDriversMap();
      const [kpis, products, debtsResp, ordersResp] = await Promise.all([
        StatsService.getKpis(),
        StatsService.getTopProducts(),
        DriverService.getDebts({ size: 5 }), // Top 5
        DriverService.getOrders({ size: 5 }) // Last 5 orders
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
      
      if (debtsResp && debtsResp.content) {
        setTopDrivers(debtsResp.content.map((d: any) => ({
          id: d.driverId,
          driver: d.fullName,
          car: d.carNumber || "Н/Д",
          total: `${d.totalDebt} сом`
        })));
        
        // В идеале сумму должен считать бэк, но если нет:
        let sum = 0;
        debtsResp.content.forEach((d: any) => sum += d.totalDebt || 0);
        setDriverDebtSum(sum);
      }
      
      if (ordersResp && ordersResp.content) {
        setRecentRequests(ordersResp.content);
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
    { title: t('dashboard.driverDebt'), value: driverDebtSum || kpiData?.driver_debt || "0", suffix: ` ${t('common.som')}`, icon: <FallOutlined style={{ color: PALETTE.error }} />, iconBg: "rgba(239, 68, 68, 0.15)" },
    { title: t('dashboard.cashbox'), value: kpiData?.cashbox || "0", suffix: ` ${t('common.som')}`, icon: <WalletOutlined style={{ color: PALETTE.success }} />, iconBg: "rgba(16, 185, 129, 0.15)" },
    { title: t('dashboard.factoryDebt'), value: kpiData?.factory_debt || "0", suffix: ` ${t('common.som')}`, icon: <BankOutlined style={{ color: "#d48806" }} />, iconBg: "rgba(245, 158, 11, 0.15)" },
  ];

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'NEW': return { color: 'warning', label: 'Новая' };
      case 'CONFIRMED': return { color: 'processing', label: 'Подтверждена' };
      case 'MODIFIED': return { color: 'warning', label: 'Изменена' };
      case 'REJECTED': return { color: 'error', label: 'Отклонена' };
      case 'DISPATCHED': return { color: 'success', label: 'Отгружена' };
      default: return { color: 'default', label: status };
    }
  };

  const recentCols = [
    { title: t('dashboard.dateCol'), dataIndex: 'createdAt', key: 'createdAt', render: (text: string) => new Date(text).toLocaleDateString('ru-RU') },
    { title: t('dashboard.driverCol'), dataIndex: 'driverId', key: 'driverId', render: (text: string, record: any) => driversMap[text] || record.driverName || (text ? text.substring(0, 6) : 'Н/Д') },
    { title: t('dashboard.amountCol'), dataIndex: 'totalAmount', key: 'totalAmount', render: (text: string) => <strong>{text} сом</strong> },
    { title: t('dashboard.statusCol'), dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={getStatusConfig(status).color} style={{ borderRadius: "12px", padding: "2px 10px" }}>{getStatusConfig(status).label}</Tag> },
    { title: t('dashboard.actionsCol'), key: 'action', render: (_: any, record: any) => <Button icon={<EyeOutlined />} size="small" style={{ borderRadius: "6px" }} onClick={() => { setSelectedOrder(record); setIsModalOpen(true); }}>{t('common.view')}</Button> },
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
    { title: 'Долг', dataIndex: 'total', key: 'total', render: (text: string) => <span style={{ color: PALETTE.error, fontWeight: 500 }}>{text}</span> },
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
        bordered={false} 
        style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
        styles={{ body: { padding: 0 } }}
      >
        <Table columns={recentCols} dataSource={recentRequests} pagination={false} rowKey="id" style={{ padding: "0 24px 24px 24px" }} />
      </Card>

      <Card 
        title={<span style={{ fontSize: "18px", fontWeight: 600 }}>{t('dashboard.topProducts')}</span>} 
        bordered={false} 
        style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
        styles={{ body: { padding: 0 } }}
      >
        <Table columns={topProductsCols} dataSource={topProducts} loading={loading} pagination={false} rowKey="id" style={{ padding: "0 24px 24px 24px" }} />
      </Card>

      <Card 
        title={<span style={{ fontSize: "18px", fontWeight: 600 }}>{t('dashboard.topDrivers')} (Должники)</span>} 
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
          <Button key="close" onClick={() => setIsModalOpen(false)}>Закрыть</Button>
        ]}
        title={
          <div style={{ paddingRight: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={3} style={{ margin: 0, fontSize: '24px' }}>Заявка</Title>
                <div style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginTop: 8, fontSize: '14px' }}>
                  Водитель: {driversMap[selectedOrder?.driverId] || selectedOrder?.driverName || selectedOrder?.driverId?.substring(0, 6) || 'Н/Д'}
                </div>
                <div style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginTop: 4, fontSize: '14px' }}>
                  {t('dashboard.requestDate')}: {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: '14px' }}>
                <Tag color={selectedOrder ? getStatusConfig(selectedOrder.status).color : 'default'}>
                  {selectedOrder ? getStatusConfig(selectedOrder.status).label : ''}
                </Tag>
              </div>
            </div>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32, marginBottom: 32, fontSize: '14px' }}>
          <div>
            <span style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginRight: 8 }}>{t('dashboard.modalTotal')}</span>
            <span style={{ fontWeight: 600 }}>{selectedOrder?.totalAmount || 0} сом</span>
          </div>
        </div>

        <Title level={5} style={{ marginBottom: 16, fontSize: '16px' }}>{t('dashboard.requestedGoods')}</Title>
        <Table
          pagination={false}
          size="middle"
          columns={[
            { title: t('common.product'), dataIndex: 'productId', key: 'product', render: (id: string) => id ? (productsMap[id]?.name || `ID: ${id.substring(0,8)}`) : 'Н/Д' },
            { title: 'Запрошено', dataIndex: 'requestedQty', key: 'requestedQty' },
            { title: 'Одобрено', dataIndex: 'approvedQty', key: 'approvedQty' },
            { title: t('dashboard.priceCol'), key: 'price', render: (_, record: any) => `${productsMap[record.productId]?.dispatch_price || 0} сом` },
            { title: t('dashboard.totalCol'), key: 'total', render: (_, record: any) => {
              const price = parseFloat(productsMap[record.productId]?.dispatch_price || '0');
              const qty = record.approvedQty || 0;
              return <span style={{ fontWeight: 600 }}>{price * qty} сом</span>;
            }}
          ]}
          dataSource={selectedOrder?.items || []}
          rowKey="id"
        />
      </Modal>
    </div>
  );
}

function FactoryDashboard() {
  const warehouses = [
    { name: "Бишкек - Главный", stock: "12 450", debt: "350 000", cash: "1 200 000" },
    { name: "Ош - Региональный", stock: "8 200", debt: "120 000", cash: "450 000" },
    { name: "Джалал-Абад", stock: "5 100", debt: "45 000", cash: "230 000" },
    { name: "Каракол", stock: "3 400", debt: "15 000", cash: "180 000" },
    { name: "Нарын", stock: "1 800", debt: "8 000", cash: "90 000" },
    { name: "Баткен", stock: "2 100", debt: "12 000", cash: "110 000" },
    { name: "Талас", stock: "2 500", debt: "5 000", cash: "140 000" },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Title level={2} style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>Сводка по складам</Title>
      <Row gutter={[16, 16]}>
        {warehouses.map((wh, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={index}>
            <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
              <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>{wh.name}</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Остаток товара</Text>
                  <Text strong>{wh.stock} шт</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Долг складу</Text>
                  <Text strong style={{ color: PALETTE.error }}>{wh.debt} сом</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Касса</Text>
                  <Text strong style={{ color: PALETTE.success }}>{wh.cash} сом</Text>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

import { useUserStore } from '../store/useUserStore';
import { UserRole } from '../types/enums';

export default function DashboardPage() {
  const { user } = useUserStore();
  const isFactory = user?.role === UserRole.Factory;

  return isFactory ? <FactoryDashboard /> : <WarehouseDashboard />;
}