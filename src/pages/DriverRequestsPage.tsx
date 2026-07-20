import { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Select, Space, Modal, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { DownloadOutlined } from '@ant-design/icons';
import { PALETTE } from '../theme/tokens';
import { DriverService } from '../services/driver.service';
import { ProductService } from '../services/product.service';
import { exportToExcel } from '../utils/exportToExcel'; // Импортируем нашу функцию экспорта

const { Title } = Typography;

export default function DriverRequestsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});
  const pageSize = 10;
  const { t } = useTranslation();

  const fetchProducts = async () => {
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

  const fetchOrders = async (currentPage = 1) => {
    setLoading(true);
    try {
      const data = await DriverService.getOrders({ page: currentPage - 1, size: pageSize });
      setOrders(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

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

  const handleAction = async (action: 'confirm' | 'dispatch' | 'reject') => {
    if (!selectedOrder) return;
    try {
      if (action === 'confirm') await DriverService.confirmOrder(selectedOrder.id);
      if (action === 'dispatch') await DriverService.dispatchOrder(selectedOrder.id);
      if (action === 'reject') await DriverService.rejectOrder(selectedOrder.id, { comment: 'Отклонено завскладом' });
      
      message.success(t('common.success'));
      setIsModalOpen(false);
      fetchOrders(page);
    } catch (e) {
      message.error(t('common.error'));
    }
  };

  // Функция для скачивания таблицы заявок в Excel
  const handleExport = () => {
    if (!orders || orders.length === 0) {
      message.warning('Нет данных для экспорта');
      return;
    }

    const dataToExport = orders.map((order, index) => ({
      '№': index + 1,
      'Водитель ID': order.driverId || 'Н/Д',
      'Сумма (сом)': order.totalAmount || 0,
      'Статус': getStatusConfig(order.status).label,
      'Дата создания': order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : '',
    }));

    exportToExcel(dataToExport, 'Driver_Requests');
    message.success('Файл успешно выгружен в Excel!');
  };

  const columns = [
    { 
      title: 'Водитель (ID)', 
      dataIndex: 'driverId', 
      key: 'driverId',
      render: (text: string) => text ? text.substring(0, 8) + '...' : 'Н/Д'
    },
    { 
      title: 'Сумма', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text} сом</span>
    },
    { 
      title: t('driverRequests.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} style={{ borderRadius: '4px', padding: '2px 8px' }}>
            {config.label}
          </Tag>
        );
      }
    },
    { 
      title: 'Дата создания', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString('ru-RU')
    },
    { 
      title: t('common.actions'), 
      key: 'action',
      render: (_: any, record: any) => (
        <Button size="small" style={{ borderRadius: '6px' }} onClick={() => {
          setSelectedOrder(record);
          setIsModalOpen(true);
        }}>{t('common.viewDetails')}</Button>
      )
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Title level={2} style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>{t('driverRequests.title')}</Title>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size="middle">
          <Select placeholder={t('driverRequests.allStatuses')} style={{ width: 140, height: 40 }} />
          <Select placeholder={t('driverRequests.allDrivers')} style={{ width: 140, height: 40 }} />
        </Space>
        
        {/* Кнопка экспорта теперь вызывает handleExport */}
        <Button 
          icon={<DownloadOutlined />} 
          size="large" 
          style={{ borderRadius: '6px' }} 
          onClick={handleExport}
        >
          {t('driverRequests.exportExcel')}
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={orders} 
          loading={loading}
          pagination={{
            current: page,
            total: total,
            pageSize: pageSize,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            showTotal: (total, range) => t('common.shown', { from: range[0], to: range[1], total: total.toLocaleString() })
          }} 
          rowKey="id" 
          style={{ padding: "24px" }}
        />
      </Card>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        footer={[
          selectedOrder?.status === 'NEW' && (
            <Button key="confirm" type="primary" onClick={() => handleAction('confirm')}>Подтвердить</Button>
          ),
          selectedOrder?.status === 'NEW' && (
            <Button key="reject" danger onClick={() => handleAction('reject')}>Отклонить</Button>
          ),
          selectedOrder?.status === 'CONFIRMED' && (
            <Button key="dispatch" style={{ color: PALETTE.success, borderColor: PALETTE.success }} onClick={() => handleAction('dispatch')}>Отгрузить</Button>
          ),
          <Button key="close" onClick={() => setIsModalOpen(false)}>Закрыть</Button>
        ].filter(Boolean)}
        title={
          <div style={{ paddingRight: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Title level={3} style={{ margin: 0, fontSize: '24px' }}>Заявка</Title>
                <div style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginTop: 8, fontSize: '14px' }}>
                  Водитель ID: {selectedOrder?.driverId?.substring(0, 8)}...
                </div>
                <div style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginTop: 4, fontSize: '14px' }}>
                  {t('driverRequests.modalRequestDate')}: {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString('ru-RU')}
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
            <span style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginRight: 8 }}>{t('driverRequests.modalTotal')}:</span>
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
            { title: t('driverRequests.priceCol'), key: 'price', render: (_, record: any) => `${productsMap[record.productId]?.dispatch_price || 0} сом` },
            { title: t('driverRequests.totalCol'), key: 'total', render: (_, record: any) => {
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