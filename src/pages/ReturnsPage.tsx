import { useState } from 'react';
import { Card, Typography, Table, Tag, Button, Modal, Form, Input, DatePicker, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { RollbackOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function ReturnsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const dataSource = [
    { id: 1, date: "16.06.2026", driver: "Иван Иванов", car: "01 KG 123 ABC", product: "Эскимо - 3 кор.", reason: "Истек срок", status: "На проверке" },
    { id: 2, date: "16.06.2026", driver: "Иван Иванов", car: "01 KG 123 ABC", product: "Эскимо - 3 кор.", reason: "Истек срок", status: "Принято" },
    { id: 3, date: "16.06.2026", driver: "Иван Иванов", car: "01 KG 123 ABC", product: "Эскимо - 3 кор.", reason: "Истек срок", status: "На проверке" },
    { id: 4, date: "16.06.2026", driver: "Иван Иванов", car: "01 KG 123 ABC", product: "Эскимо - 3 кор.", reason: "Истек срок", status: "На проверке" },
  ];

  const columns = [
    { title: t('returns.dateCol'), dataIndex: 'date', key: 'date' },
    { title: t('returns.driverCol'), dataIndex: 'driver', key: 'driver' },
    { 
      title: t('returns.carCol'), 
      dataIndex: 'car', 
      key: 'car',
      render: (text: string) => (
        <span style={{ background: 'var(--color-bg-layout, #f5f5f5)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: 'var(--color-text-secondary, #595959)', border: '1px solid var(--color-border, #e8e8e8)' }}>
          {text}
        </span>
      )
    },
    { title: t('returns.productCol'), dataIndex: 'product', key: 'product' },
    { title: t('returns.reasonCol'), dataIndex: 'reason', key: 'reason' },
    { 
      title: t('returns.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const isAccepted = status === t('statuses.accepted') || status === 'Принято';
        return (
          <Tag color={isAccepted ? 'success' : 'warning'} style={{ borderRadius: '4px', padding: '2px 8px' }}>
            {status}
          </Tag>
        );
      }
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>{t('returns.title')}</Title>
        <Button type="primary" icon={<RollbackOutlined />} size="large" style={{ borderRadius: '6px' }} onClick={() => setIsModalOpen(true)}>{t('returns.newReturn')}</Button>
      </div>

      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={dataSource} 
          pagination={{
            total: 1240,
            pageSize: 4,
            showSizeChanger: false,
            showTotal: (total, range) => t('common.shown', { from: range[0], to: range[1], total: total.toLocaleString() })
          }} 
          rowKey="id" 
          style={{ padding: "24px" }}
        />
      </Card>

      <Modal
        title={t('returns.newReturn')}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            {t('common.cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={() => { form.submit(); setIsModalOpen(false); }}>
            {t('returns.submitRequest')}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label={t('common.date')} name="date" rules={[{ required: true, message: t('common.selectDate') }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          
          <Form.Item label={t('returns.driverLabel')} name="driver" rules={[{ required: true, message: t('returns.selectDriver') }]}>
            <Select placeholder={t('returns.selectDriver')}>
              <Select.Option value="ivan">Иван Иванов</Select.Option>
              <Select.Option value="petr">Петр Петров</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={t('common.product')} name="product" rules={[{ required: true, message: t('common.selectProduct') }]}>
            <Select placeholder={t('common.selectProduct')}>
              <Select.Option value="eskimo">Эскимо в шоколаде</Select.Option>
              <Select.Option value="plombir">Пломбир</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={t('returns.quantityLabel')} name="quantity" rules={[{ required: true, message: t('common.enterQuantity') }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item label={t('returns.reasonLabel')} name="reason" rules={[{ required: true, message: t('returns.selectReason') }]}>
            <Select placeholder={t('returns.selectReason')}>
              <Select.Option value="expired">{t('returns.expired')}</Select.Option>
              <Select.Option value="damaged">{t('returns.defective')}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
