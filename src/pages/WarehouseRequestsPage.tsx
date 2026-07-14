// src/pages/WarehouseRequestsPage.tsx
import { useEffect, useState } from 'react';
import { Table, Button, Card, Typography, Tag, Space, Badge, App } from 'antd';
import { CheckOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';
import { WarehouseOrderService } from '../services/warehouseOrder.service';
import type { WarehouseOrder } from '../types/api.types';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { PALETTE } from '../theme/tokens';

const { Title, Text } = Typography;

export default function WarehouseRequestsPage() {
  const { t } = useTranslation();
  const { notification, message } = App.useApp();
  
  const [orders, setOrders] = useState<WarehouseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await WarehouseOrderService.getOrders(1, 100);
      setOrders(data.results);
    } catch (error) {
      notification.error({ message: t('warehouseRequests.errorLoading', 'Ошибка при загрузке заявок') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (record: WarehouseOrder, status: string) => {
    if (!record.id) return;
    setActionLoadingId(`${record.id}-${status}`);
    try {
      await WarehouseOrderService.updateStatus(record.id, status);
      message.success(`${t('warehouseRequests.statusUpdated', 'Статус заявки обновлен на')} ${status}`);
      fetchOrders();
    } catch (error) {
      message.error(t('warehouseRequests.errorUpdating', 'Не удалось обновить статус'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = [
    {
      title: t('warehouseRequests.orderNo', '№ Заявки'),
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <Space>
          <FileTextOutlined style={{ color: PALETTE.primary }} />
          <Text strong>{text ? text.substring(0, 8) : 'N/A'}...</Text>
        </Space>
      ),
    },
    {
      title: t('warehouseRequests.senderWarehouse', 'Склад-отправитель'),
      dataIndex: 'warehouse_id',
      key: 'warehouse_id',
      render: (id: string) => <Text code>{id ? id.substring(0, 8) : 'N/A'}</Text>,
    },
    {
      title: t('warehouseRequests.requestItems', 'Позиции запроса'),
      dataIndex: 'items',
      key: 'items',
      render: (items: { product_id?: string; productId?: string; qty: number }[]) => (
        <Space direction="vertical" size="small">
          {(items || []).map((item, i) => (
            <Badge 
              key={i} 
              status="processing" 
              text={`${item.product_id ? item.product_id.substring(0, 8) : item.productId} — ${item.qty} шт.`} 
            />
          ))}
        </Space>
      ),
    },
    {
      title: t('warehouseRequests.createdAt', 'Дата создания'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: t('warehouseRequests.status', 'Статус'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'APPROVED' ? 'green' : status === 'REJECTED' ? 'red' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: t('common.actions', 'Действия'),
      key: 'actions',
      render: (_: any, record: WarehouseOrder) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            disabled={record.status !== 'PENDING'}
            loading={actionLoadingId === `${record.id}-APPROVED`}
            onClick={() => handleStatusChange(record, 'APPROVED')}
          >
            {t('actions.approve')}
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            size="small"
            disabled={record.status !== 'PENDING'}
            loading={actionLoadingId === `${record.id}-REJECTED`}
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
        <Title level={3} style={{ color: PALETTE.primary, margin: 0, fontSize: '20px' }}>
          {t('menu.warehouseRequests')}
        </Title>
        <Text type="secondary">
          {t('warehouseRequests.subtitle')}
        </Text>
      </Card>

      <Table
        loading={loading}
        dataSource={orders}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 20 }}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: t('warehouseRequests.noActive', 'Нет активных заявок.') }}
      />
    </div>
  );
}
