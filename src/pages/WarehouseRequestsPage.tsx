// src/pages/WarehouseRequestsPage.tsx
import { Table, Button, Card, Typography, Tag, Space, Badge } from 'antd';
import { CheckOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';
import { useRequestStore } from '../store/useRequestStore';
import { useRequestOperations } from '../hooks/useRequestOperations';
import type { WarehouseRequest, RequestStatus } from '../utils/requestAlgorithms';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export default function WarehouseRequestsPage() {
  const { t } = useTranslation();
  const store = useRequestStore();
  const { handleStatusChange } = useRequestOperations(store);

  const columns = [
    {
      title: '№ Заявки',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Склад-отправитель',
      dataIndex: 'warehouseId',
      key: 'warehouseId',
    },
    {
      title: 'Позиции запроса',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <Space direction="vertical" size="small">
          {items.map((item, i) => (
            <Badge 
              key={i} 
              status="processing" 
              text={`${item.productId} — ${item.quantity} шт.`} 
            />
          ))}
        </Space>
      ),
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: RequestStatus) => {
        const statusConfig: Record<RequestStatus, { color: string; label: string }> = {
          PENDING: { color: 'orange', label: t('status.pending') },
          APPROVED: { color: 'green', label: t('status.approved') },
          REJECTED: { color: 'red', label: t('status.rejected') },
          COMPLETED: { color: 'blue', label: t('status.completed') },
        };
        return <Tag color={statusConfig[status].color}>{statusConfig[status].label}</Tag>;
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: WarehouseRequest) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            disabled={record.status !== 'PENDING'}
            onClick={() => handleStatusChange(record, 'APPROVED')}
          >
            {t('actions.approve')}
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            size="small"
            disabled={record.status !== 'PENDING'}
            onClick={() => handleStatusChange(record, 'REJECTED')}
          >
            {t('actions.reject')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 24, borderRadius: '4px' }}>
        <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: '20px' }}>
          {t('menu.warehouseRequests')}
        </Title>
        <Text type="secondary">
          Мониторинг, верификация остатков и утверждение входящих заявок от региональных складов компании.
        </Text>
      </Card>

      <Table
        dataSource={store.requests}
        columns={columns}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}
