import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Typography, Table, Tag, Button, Select, Modal, Form, DatePicker, Input, App } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { PALETTE } from '../theme/tokens';
import { WarehouseOrderService } from '../services/warehouseOrder.service';
import type { WarehouseOrder } from '../types/api.types';
import { useAccess } from '../hooks/useAccess';

const { Title } = Typography;
const { TextArea } = Input;

export default function WarehouseRequestsPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const { message } = App.useApp();
  const { canManageWarehouse } = useAccess();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = async (page: number) => {
    setLoading(true);
    try {
      const res = await WarehouseOrderService.getOrders(page, pageSize);
      setTotal(res.count);
      
      const flattenedData: any[] = [];
      res.results.forEach((order: WarehouseOrder) => {
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            flattenedData.push({
              id: item.id || Math.random().toString(),
              orderId: order.id,
              req: order.id ? order.id.slice(0, 8) : "WREQ-XXX",
              date: new Date(order.created_at || Date.now()).toLocaleDateString('ru-RU'),
              product: item.productId || item.product_id ? `Товар ${(item.productId || item.product_id)?.slice(0,8)}` : "—",
              quantity: item.qty || 0,
              note: order.comment || "—",
              status: order.status || "pending",
            });
          });
        } else {
          flattenedData.push({
            id: order.id,
            orderId: order.id,
            req: order.id ? order.id.slice(0, 8) : "WREQ-XXX",
            date: new Date(order.created_at || Date.now()).toLocaleDateString('ru-RU'),
            product: "—",
            quantity: 0,
            note: order.comment || "—",
            status: order.status || "pending",
          });
        }
      });
      setData(flattenedData);
    } catch (err) {
      console.error(err);
      message.error(t('warehouseRequests.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  // Функция для создания заявки (привязана к форме)
  const handleCreateRequest = async (values: any) => {
    setConfirmLoading(true);
    try {
      // Здесь вызываем реальный сервис создания (когда бэкенд оживет)
      await WarehouseOrderService.createOrder(values); 
      message.success('Заявка успешно добавлена!');
      setIsModalOpen(false);
      form.resetFields();
      loadData(currentPage);
    } catch (error) {
      console.error(error);
      message.error('Ошибка при создании заявки');
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    { 
      title: t('warehouseRequests.requestNoCol'), 
      dataIndex: 'req', 
      key: 'req',
      render: (text: string) => <a style={{ color: PALETTE.primary }}>{text}</a>
    },
    { title: t('warehouseRequests.dateCol'), dataIndex: 'date', key: 'date' },
    { title: t('warehouseRequests.productCol'), dataIndex: 'product', key: 'product' },
    { title: t('warehouseRequests.quantityCol'), dataIndex: 'quantity', key: 'quantity' },
    { title: t('warehouseRequests.noteCol'), dataIndex: 'note', key: 'note' },
    { 
      title: t('warehouseRequests.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const s = status?.toLowerCase() || '';
        const isAccepted = s === 'принято заводом' || s === 'accepted';
        const isCompleted = s === 'выдано' || s === 'completed';
        
        if (isAccepted) {
          return <Tag color="processing" style={{ borderRadius: '4px', padding: '2px 8px' }}>{status}</Tag>;
        } else if (isCompleted) {
          return <Tag color="success" style={{ borderRadius: '4px', padding: '2px 8px' }}>{status}</Tag>;
        } else if (s === 'отправлено' || s === 'pending') {
          return <Tag color="warning" style={{ borderRadius: '4px', padding: '2px 8px' }}>{status}</Tag>;
        }
        return <Tag style={{ borderRadius: '4px', padding: '2px 8px' }}>{status}</Tag>;
      }
    },
    { 
      title: t('warehouseRequests.actionCol'), 
      key: 'action',
      render: () => (
        <Button size="small" style={{ borderRadius: '6px', color: '#bfbfbf' }}>{t('warehouseRequests.cancelBtn')}</Button>
      )
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Title level={2} style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>{t('warehouseRequests.title')}</Title>
          <Select placeholder={t('warehouseRequests.statusFilter')} style={{ width: 120, height: 40 }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button icon={<ReloadOutlined />} size="large" style={{ borderRadius: '6px' }} onClick={() => loadData(currentPage)} />
          {canManageWarehouse && (
            <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: '6px' }} onClick={() => setIsModalOpen(true)}>
              {t('warehouseRequests.createRequest')}
            </Button>
          )}
        </div>
      </div>

      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          pagination={{
            current: currentPage,
            total: total,
            pageSize: pageSize,
            showSizeChanger: false,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total, range) => `Показано ${range[0]}-${range[1]} из ${total.toLocaleString()}`
          }} 
          rowKey="id" 
          style={{ padding: "24px" }}
        />
      </Card>

      <Modal
        title={t('warehouseRequests.modalTitle')}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={confirmLoading}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            {t('warehouseRequests.cancelBtn')}
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()} loading={confirmLoading}>
            {t('warehouseRequests.submitBtn')}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRequest} style={{ marginTop: 24 }}>
          <Form.Item label={t('warehouseRequests.dateCol')} name="date" rules={[{ required: true, message: t('common.selectDate') }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          
          <Form.Item label={t('warehouseRequests.carLabel')} name="car" rules={[{ required: true, message: t('warehouseRequests.selectCar') }]}>
            <Select placeholder={t('warehouseRequests.selectCar')}>
              <Select.Option value="car1">01 KG 123 ABC</Select.Option>
              <Select.Option value="car2">02 KG 456 DEF</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={t('common.quantity')} name="quantity" rules={[{ required: true, message: t('common.enterQuantity') }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item label={t('common.note')} name="note">
            <TextArea placeholder={t('common.optional')} rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}