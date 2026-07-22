import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Table, Tag, Button, Select, Pagination, Spin, Typography, App, Modal, Form, Input, InputNumber } from 'antd';
import { 
  ExclamationCircleFilled,
  LoadingOutlined
} from '@ant-design/icons';
import emptyIllustration from '../assets/Empty Products Illustration.png';

import { ProductService } from '../services/product.service';
import type { Product } from '../types/api.types';
import { useAccess } from '../hooks/useAccess';

const { Title, Text } = Typography;

export default function WarehousePage() {
  const { t } = useTranslation();
  const { isAdmin, isManager } = useAccess();
  const [appState, setAppState] = useState<'loading' | 'empty' | 'error' | 'success'>('loading');
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { message } = App.useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleAddProduct = async (values: any) => {
    setConfirmLoading(true);
    try {
      // Вызываем сервис создания товара (если он есть в ProductService, 
      // либо заменяем на твой реальный метод создания)
      await ProductService.createProduct(values);
      message.success('Товар успешно добавлен!');
      setIsModalOpen(false);
      form.resetFields();
      loadData(currentPage); // Перезагружаем таблицу
    } catch (error) {
      console.error(error);
      message.error('Ошибка при добавлении товара');
    } finally {
      setConfirmLoading(false);
    }
  };

  const loadData = async (page: number) => {
    setAppState('loading');
    try {
      const res = await ProductService.getProducts(page, pageSize);
      setProducts(res.results);
      setTotal(res.count);
      setAppState(res.results.length > 0 ? 'success' : 'empty');
    } catch (error) {
      console.error(error);
      setAppState('error');
      message.error(t('warehouse.errorLoading'));
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const columns = [
    { title: t('warehouse.barcodeCol'), dataIndex: 'barcode', key: 'barcode' },
    { title: t('warehouse.productCol'), dataIndex: 'name', key: 'name' },
    { 
      title: t('warehouse.inBoxCol'), 
      dataIndex: 'pieces_per_box', 
      key: 'pieces_per_box', 
      render: (text: number) => `${text} ${t('common.pcs')}` 
    },
    { title: t('warehouse.factoryPriceCol'), dataIndex: 'factory_price', key: 'factory_price', render: (val: string) => `${val} с` },
    { title: t('warehouse.dispatchPriceCol'), dataIndex: 'dispatch_price', key: 'dispatch_price', render: (val: string) => `${val} с` },
    { 
      title: t('warehouse.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const s = status?.toLowerCase() || '';
        let color = 'default';
        let label = status || t('statuses.unknown');

        if (s === 'active' || s === 'норма') { color = 'success'; label = t('statuses.active'); }
        else if (s === 'low_stock' || s === 'низкий') { color = 'warning'; label = t('statuses.low_stock'); }
        else if (s === 'no_stock' || s === 'критический') { color = 'error'; label = t('statuses.no_stock'); }

        return <Tag color={color} style={{ borderRadius: '4px' }}>{label}</Tag>;
      }
    },
    ...(isAdmin || isManager ? [{
      title: t('common.actions'), 
      key: 'actions',
      render: (_: any, record: any) => (
        <Button size="small" onClick={() => console.log('Редактировать', record.id)}>
          {t('common.edit') || 'Редактировать'}
        </Button>
      ),
    }] : []),
  ];

  if (appState === 'error') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <ExclamationCircleFilled style={{ fontSize: 32, color: '#ff4d4f', marginBottom: 16 }} />
          <Title level={4}>{t('warehouse.errorTitle')}</Title>
          <Button type="primary" onClick={() => loadData(currentPage)}>{t('warehouse.retry')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: "28px" }}>{t('warehouse.title')}</Title>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isAdmin && (
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              {t('warehouse.addProduct') || 'Добавить товар'}
            </Button>
          )}
          <Select defaultValue="all" style={{ width: 120 }} options={[{ value: 'all', label: t('common.all') }]} />
        </div>
      </div>

      <Card variant="borderless" style={{ borderRadius: '8px' }} styles={{ body: { padding: 0 } }}>
        {appState === 'loading' ? (
          <div style={{ minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          </div>
        ) : appState === 'empty' ? (
            <div style={{ textAlign: 'center', padding: '64px' }}>
                <img src={emptyIllustration} alt="Empty" style={{ width: 140, marginBottom: 24 }} />
                <Title level={4}>{t('warehouse.emptyTitle')}</Title>
            </div>
        ) : (
          <>
            <Table columns={columns} dataSource={products} pagination={false} rowKey="id" />
            <div style={{ padding: "16px 24px", display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">{t('common.showing')} {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, total)}</Text>
              <Pagination current={currentPage} total={total} pageSize={pageSize} onChange={setCurrentPage} />
            </div>
          </>
        )}
      </Card>
      {/* Модальное окно добавления товара */}
      <Modal
        title={t('warehouse.addProduct') || 'Добавить товар'}
        open={isModalOpen}
        onOk={() => form.submit()}
        confirmLoading={confirmLoading}
        onCancel={() => setIsModalOpen(false)}
        okText="Добавить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={handleAddProduct}>
          <Form.Item name="barcode" label="Баркод (SKU)" rules={[{ required: true, message: 'Введите штрихкод!' }]}>
            <Input placeholder="Введите баркод" />
          </Form.Item>

          <Form.Item name="name" label="Название товара" rules={[{ required: true, message: 'Введите название!' }]}>
            <Input placeholder="Введите название товара" />
          </Form.Item>

          <Form.Item name="pieces_per_box" label="Штук в коробке" rules={[{ required: true, message: 'Введите количество!' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="Например: 20" />
          </Form.Item>

          <Form.Item name="factory_price" label="Заводская цена" rules={[{ required: true, message: 'Введите цену!' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>

          <Form.Item name="dispatch_price" label="Цена отгрузки" rules={[{ required: true, message: 'Введите цену!' }]}>
            <InputNumber style={{ width: '100%' }} placeholder="0.00" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}