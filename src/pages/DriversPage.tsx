import { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Space, Modal, Form, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  PlusOutlined,
  EditOutlined
} from '@ant-design/icons';
import { DriverService } from '../services/driver.service';

const { Title, Text } = Typography;

export default function DriversPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchDrivers = async (currentPage = 1) => {
    setLoading(true);
    try {
      const data = await DriverService.getDrivers({ page: currentPage - 1, size: pageSize });
      setDrivers(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers(page);
  }, [page]);

  const handleAdd = () => {
    setModalMode('add');
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setModalMode('edit');
    form.setFieldsValue({
      fullName: record.fullName,
      carNumber: record.carNumber,
      phone: record.phone,
    });
    setIsModalOpen(true);
  };

  const onFinish = async (values: any) => {
    try {
      if (modalMode === 'add') {
        await DriverService.createDriver({
          ...values,
          password: 'password123', // Временный пароль по умолчанию
        });
        message.success(t('common.success'));
        setIsModalOpen(false);
        fetchDrivers(page);
      } else {
        // Редактирование пока не реализовано в API водителе-менеджера
        message.info('Редактирование пока недоступно');
      }
    } catch (error) {
      console.error('Failed to save driver:', error);
      message.error(t('common.error'));
    }
  };

  const columns = [
    { title: t('drivers.nameCol'), dataIndex: 'fullName', key: 'fullName' },
    { 
      title: t('drivers.plateCol'), 
      dataIndex: 'carNumber', 
      key: 'carNumber',
      render: (text: string) => (
        <span style={{ background: 'var(--color-bg-layout, #f5f5f5)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: 'var(--color-text-secondary, #595959)', border: '1px solid var(--color-border, #e8e8e8)' }}>
          {text}
        </span>
      )
    },
    { title: t('drivers.phoneCol'), dataIndex: 'phone', key: 'phone' },
    { 
      title: t('common.actions'), 
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" style={{ borderRadius: '6px' }} onClick={() => handleEdit(record)}>{t('common.edit')}</Button>
        </Space>
      )
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>{t('drivers.title')}</Title>
          <Text type="secondary">{t('drivers.subtitle')}</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: '6px' }} onClick={handleAdd}>{t('drivers.addDriver')}</Button>
      </div>

      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={drivers} 
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
        title={modalMode === 'add' ? t('drivers.addDriver') : t('drivers.editDriver')}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            {t('common.cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {t('common.save')}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
          <Form.Item label={t('drivers.nameLabel')} name="fullName" rules={[{ required: true, message: t('drivers.nameRequired') }]}>
            <Input />
          </Form.Item>
          
          <Form.Item label={t('drivers.plateLabel')} name="carNumber" rules={[{ required: true, message: t('drivers.plateRequired') }]}>
            <Input />
          </Form.Item>

          <Form.Item label={t('drivers.phoneLabel')} name="phone" rules={[{ required: true, message: t('drivers.phoneRequired') }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
