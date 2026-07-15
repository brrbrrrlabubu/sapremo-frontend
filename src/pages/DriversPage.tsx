import { useState } from 'react';
import { Card, Typography, Table, Tag, Button, Space, Modal, Form, Input, Popconfirm } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function DriversPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const dataSource = [
    { id: 1, name: "Иванов Иван Иванович", plate: "01 KG 123 ABC", phone: "+996 555 123 456", debt: "15 000" },
    { id: 2, name: "Иванов Иван Иванович", plate: "01 KG 123 ABC", phone: "+996 555 123 456", debt: t('drivers.noDebt') },
    { id: 3, name: "Иванов Иван Иванович", plate: "01 KG 123 ABC", phone: "+996 555 123 456", debt: "145000", critical: true },
    { id: 4, name: "Иванов Иван Иванович", plate: "01 KG 123 ABC", phone: "+996 555 123 456", debt: "15 000" },
  ];

  const handleAdd = () => {
    setModalMode('add');
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setModalMode('edit');
    form.setFieldsValue({
      name: record.name,
      plate: record.plate,
      phone: record.phone,
      debt: record.debt === t('drivers.noDebt') || record.debt === 'Нет долга' ? '' : record.debt.replace(/\s/g, '')
    });
    setIsModalOpen(true);
  };

  const columns = [
    { title: t('drivers.nameCol'), dataIndex: 'name', key: 'name' },
    { 
      title: t('drivers.plateCol'), 
      dataIndex: 'plate', 
      key: 'plate',
      render: (text: string) => (
        <span style={{ background: 'var(--color-bg-layout, #f5f5f5)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: 'var(--color-text-secondary, #595959)', border: '1px solid var(--color-border, #e8e8e8)' }}>
          {text}
        </span>
      )
    },
    { title: t('drivers.phoneCol'), dataIndex: 'phone', key: 'phone' },
    { 
      title: t('drivers.currentDebtCol'), 
      dataIndex: 'debt', 
      key: 'debt',
      render: (text: string, record: any) => {
        if (text === t('drivers.noDebt') || text === 'Нет долга') {
          return <Tag color="success" style={{ borderRadius: '4px', padding: '2px 8px' }}>{t('drivers.noDebt')}</Tag>;
        }
        if (record.critical) {
          return <span style={{ color: '#ff4d4f' }}>{text}</span>;
        }
        return <span>{text}</span>;
      }
    },
    { 
      title: t('common.actions'), 
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" style={{ borderRadius: '6px' }} onClick={() => handleEdit(record)}>{t('common.edit')}</Button>
          <Popconfirm
            title={t('drivers.deleteConfirm')}
            description={t('common.deleteWarning')}
            icon={<ExclamationCircleFilled style={{ color: '#faad14' }} />}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small" style={{ borderRadius: '6px' }} />
          </Popconfirm>
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
        title={modalMode === 'add' ? t('drivers.addDriver') : t('drivers.editDriver')}
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
          <Form.Item label={t('drivers.nameLabel')} name="name" rules={[{ required: true, message: t('drivers.nameRequired') }]}>
            <Input />
          </Form.Item>
          
          <Form.Item label={t('drivers.plateLabel')} name="plate" rules={[{ required: true, message: t('drivers.plateRequired') }]}>
            <Input />
          </Form.Item>

          <Form.Item label={t('drivers.phoneLabel')} name="phone" rules={[{ required: true, message: t('drivers.phoneRequired') }]}>
            <Input />
          </Form.Item>

          <Form.Item label={t('drivers.initialDebtLabel')} name="debt">
            <Input addonAfter={t('common.som')} type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
