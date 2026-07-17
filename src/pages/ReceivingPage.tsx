import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Table, Tag, Button, Modal, Form, Input, DatePicker, Select, App } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { ReceptionService } from '../services/reception.service';
import type { Reception } from '../types/api.types';
import { useAccess } from '../hooks/useAccess';

export default function ReceivingPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { isFactory, canCreateReception } = useAccess();

  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = async (page: number) => {
    setLoading(true);
    try {
      const res = await ReceptionService.getReceptions(page, pageSize);
      setTotal(res.count);
      
      const flattenedData: any[] = [];
      res.results.forEach((reception: Reception) => {
        if (reception.items && reception.items.length > 0) {
          reception.items.forEach(item => {
            flattenedData.push({
              id: item.id || Math.random().toString(),
              date: new Date(reception.delivered_at).toLocaleDateString('ru-RU'),
              batch: reception.delivery_number,
              product: item.product_name || t('common.unknownProduct'),
              quantity: item.expected_qty,
              status: reception.status_display || reception.status || "Ожидается",
            });
          });
        } else {
          flattenedData.push({
            id: reception.id,
            date: new Date(reception.delivered_at).toLocaleDateString('ru-RU'),
            batch: reception.delivery_number,
            product: "—",
            quantity: 0,
            status: reception.status_display || reception.status || "Ожидается",
          });
        }
      });
      setData(flattenedData);
    } catch (err) {
      console.error(err);
      message.error(t('receiving.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const columns = [
    { title: t('receiving.dateCol'), dataIndex: 'date', key: 'date' },
    { 
      title: t('receiving.batchCol'), 
      dataIndex: 'batch', 
      key: 'batch',
      render: (text: string) => (
        <span style={{ background: 'var(--color-bg-layout, #f5f5f5)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: 'var(--color-text-secondary, #595959)', border: '1px solid var(--color-border, #e8e8e8)' }}>
          {text}
        </span>
      )
    },
    { title: t('receiving.productCol'), dataIndex: 'product', key: 'product' },
    { title: t('receiving.quantityCol'), dataIndex: 'quantity', key: 'quantity' },
    { 
      title: t('receiving.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const s = status?.toLowerCase() || '';
        const isAccepted = s === 'принято' || s === 'completed' || s === 'arrived';
        const isPending = s === 'ожидается' || s === 'pending';
        return (
          <Tag color={isAccepted ? 'success' : (isPending ? 'warning' : 'processing')} style={{ borderRadius: '4px', padding: '2px 8px' }}>
            {status}
          </Tag>
        );
      }
    },
  ];

  return (
    <>
      <Card 
        bordered={false} 
        style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} 
        styles={{ body: { padding: 0 }, header: { borderBottom: 'none', padding: '16px 24px 0' } }}
        extra={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button icon={<ReloadOutlined />} onClick={() => loadData(currentPage)} />
              {canCreateReception && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            {t('receiving.newReception')}
          </Button>
            )}
        </div>
        }
      >
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
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

      {canCreateReception && (
        <Modal
          title={t('receiving.modalTitle')}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={[
            <Button key="back" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>,
            <Button key="submit" type="primary" onClick={() => { form.submit(); setIsModalOpen(false); }}>
              {t('common.save')}
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
            <Form.Item label={t('receiving.dateCol')} name="date" rules={[{ required: true, message: t('common.selectDate') }]}>
              <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
            </Form.Item>
            
            <Form.Item label={t('receiving.batchNumber')} name="batch" rules={[{ required: true, message: t('receiving.enterBatch') }]}>
              <Input placeholder={t('receiving.batchPlaceholder')} />
            </Form.Item>

            <Form.Item label={t('receiving.productCol')} name="product" rules={[{ required: true, message: t('common.selectProduct') }]}>
              <Select placeholder={t('common.selectProduct')}>
                <Select.Option value="plombir">Пломбир «Сливочный» 80г</Select.Option>
                <Select.Option value="eskimo">Эскимо в шоколаде</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label={t('receiving.quantityLabel')} name="quantity" rules={[{ required: true, message: t('common.enterQuantity') }]}>
              <Input type="number" />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
}
