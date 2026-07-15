import { useState } from 'react';
import { Card, Typography, Table, Tag, Button, Select, Space, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { DownloadOutlined } from '@ant-design/icons';
import { PALETTE } from '../theme/tokens';

const { Title } = Typography;

export default function DriverRequestsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  const dataSource = [
    { id: 1, driver: "Саматов Тимур", car: "01 KG 123 ABC", date: "01.05.2026", amount: `15 000 ${t('common.som')}`, status: t('statuses.cash') },
    { id: 2, driver: "Саматов Тимур", car: "01 KG 123 ABC", date: "01.05.2026", amount: `15 000 ${t('common.som')}`, status: t('statuses.pending') },
    { id: 3, driver: "Саматов Тимур", car: "01 KG 123 ABC", date: "01.05.2026", amount: `15 000 ${t('common.som')}`, status: t('statuses.rejected') },
    { id: 4, driver: "Саматов Тимур", car: "01 KG 123 ABC", date: "01.05.2026", amount: `15 000 ${t('common.som')}`, status: t('statuses.confirmed') },
  ];

  const columns = [
    { title: t('driverRequests.driverCol'), dataIndex: 'driver', key: 'driver' },
    { 
      title: t('driverRequests.carCol'), 
      dataIndex: 'car', 
      key: 'car',
      render: (text: string) => (
        <span style={{ background: 'var(--color-bg-layout, #f5f5f5)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: 'var(--color-text-secondary, #595959)', border: '1px solid var(--color-border, #e8e8e8)' }}>
          {text}
        </span>
      )
    },
    { title: t('driverRequests.dateCol'), dataIndex: 'date', key: 'date' },
    { 
      title: t('driverRequests.amountCol'), 
      dataIndex: 'amount', 
      key: 'amount',
      render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span>
    },
    { 
      title: t('driverRequests.statusCol'), 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === t('statuses.cash') || status === t('statuses.confirmed') || status === 'Наличный' || status === 'Потверждено') {
          color = (status === t('statuses.cash') || status === 'Наличный') ? 'success' : 'processing';
        } else if (status === t('statuses.pending') || status === 'Ожидается') {
          color = 'warning';
        } else if (status === t('statuses.rejected') || status === 'Откланено') {
          color = 'error';
        }
        return (
          <Tag color={color} style={{ borderRadius: '4px', padding: '2px 8px' }}>
            {status}
          </Tag>
        );
      }
    },
    { 
      title: t('common.actions'), 
      key: 'action',
      render: () => (
        <Button size="small" style={{ borderRadius: '6px' }} onClick={() => setIsModalOpen(true)}>{t('common.viewDetails')}</Button>
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
        <Button icon={<DownloadOutlined />} size="large" style={{ borderRadius: '6px' }}>{t('driverRequests.exportExcel')}</Button>
      </div>

      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={dataSource} 
          pagination={{
            total: 1240,
            pageSize: 5,
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
                  {t('driverRequests.modalRequestDate')}: 20.06.2026
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
            <span style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginRight: 8 }}>{t('driverRequests.modalDriver')}:</span>
            <span>Саматов Тимур</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginRight: 8 }}>{t('driverRequests.modalCar')}:</span>
            <span style={{ background: 'var(--color-bg-layout, #f5f5f5)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--color-border, #e8e8e8)', color: 'var(--color-text-secondary, #595959)' }}>MH 1234 KG</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginRight: 8 }}>{t('driverRequests.modalDate')}:</span>
            <span>20.06.2026</span>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-secondary, #8c8c8c)', marginRight: 8 }}>{t('driverRequests.modalTotal')}:</span>
            <span style={{ fontWeight: 600 }}>15 000 сом</span>
          </div>
        </div>

        <Title level={5} style={{ marginBottom: 16, fontSize: '16px' }}>{t('driverRequests.requestedProducts')}</Title>
        <Table
          pagination={false}
          size="middle"
          columns={[
            { title: t('common.product'), dataIndex: 'name', key: 'name' },
            { title: t('common.quantity'), dataIndex: 'qty', key: 'qty' },
            { title: t('driverRequests.priceCol'), dataIndex: 'price', key: 'price' },
            { title: t('driverRequests.totalCol'), dataIndex: 'total', key: 'total', render: (text: string) => <span style={{ fontWeight: 600 }}>{text}</span> }
          ]}
          dataSource={[
            { id: 1, name: "Пломбир «Сливочный» 80г", qty: 10, price: "42 сом", total: "4 200 сом" },
            { id: 2, name: "Эскимо в шоколаде", qty: 5, price: "60 сом", total: "3 000 сом" },
            { id: 3, name: "Рожок фисташковый", qty: 4, price: "78 сом", total: "3 120 сом" },
          ]}
          rowKey="id"
          summary={() => (
            <Table.Summary.Row style={{ background: 'var(--color-bg-layout, #fafafa)' }}>
              <Table.Summary.Cell index={0}><span style={{ fontWeight: 600 }}>{t('common.total')}</span></Table.Summary.Cell>
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
