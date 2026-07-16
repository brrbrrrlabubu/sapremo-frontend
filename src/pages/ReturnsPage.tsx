import { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, message, Popconfirm } from 'antd';
import { useTranslation } from 'react-i18next';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { DriverService } from '../services/driver.service';
import { ProductService } from '../services/product.service';

export default function ReturnsPage() {
  const { t } = useTranslation();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});
  const pageSize = 10;

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

  const fetchReturns = async (currentPage = 1) => {
    setLoading(true);
    try {
      const data = await DriverService.getReturns({ page: currentPage - 1, size: pageSize });
      setReturns(data.content || []);
      setTotal(data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchReturns(page);
  }, [page]);

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') {
        await DriverService.acceptReturn(id);
      } else {
        await DriverService.rejectReturn(id);
      }
      message.success(t('common.success'));
      fetchReturns(page);
    } catch (error) {
      message.error(t('common.error'));
    }
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'PENDING': return { color: 'warning', label: 'На проверке' };
      case 'ACCEPTED': return { color: 'success', label: 'Принято' };
      case 'REJECTED': return { color: 'error', label: 'Отклонено' };
      default: return { color: 'default', label: status };
    }
  };

  const columns = [
    { 
      title: t('returns.dateCol'), 
      dataIndex: 'returnedAt', 
      key: 'returnedAt',
      render: (text: string, record: any) => new Date(text || record.createdAt).toLocaleDateString('ru-RU')
    },
    { 
      title: t('returns.driverCol'), 
      dataIndex: 'driverId', 
      key: 'driverId',
      render: (text: string, record: any) => record.driverName || (text ? text.substring(0, 6) : 'Н/Д')
    },
    { 
      title: t('returns.productCol'), 
      key: 'product',
      render: (_: any, record: any) => {
        if (!record.items || record.items.length === 0) return 'Н/Д';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {record.items.map((item: any) => {
              const productName = item.productId ? (productsMap[item.productId]?.name || `ID: ${item.productId.substring(0,8)}`) : 'Н/Д';
              const boxes = item.qtyBoxes > 0 ? `${item.qtyBoxes} кор. ` : '';
              const pieces = item.qtyPieces > 0 ? `${item.qtyPieces} шт.` : '';
              const qty = boxes + pieces || '0 шт.';
              return <div key={item.id}>{productName} — {qty}</div>;
            })}
          </div>
        );
      }
    },
    { 
      title: t('returns.reasonCol'), 
      key: 'reason',
      render: (_: any, record: any) => {
        if (!record.items || record.items.length === 0) return 'Н/Д';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {record.items.map((item: any) => (
              <div key={item.id}>{item.reason === 'MELTED' ? 'Растаяло' : item.reason === 'NOT_SOLD' ? 'Не продано' : item.reason}</div>
            ))}
          </div>
        );
      }
    },
    { 
      title: t('returns.statusCol'), 
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
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: any) => {
        if (record.status !== 'PENDING') return null;
        return (
          <Space>
            <Popconfirm title="Принять возврат?" onConfirm={() => handleAction(record.id, 'accept')}>
              <Button type="primary" size="small" icon={<CheckOutlined />} style={{ background: '#52c41a' }} />
            </Popconfirm>
            <Popconfirm title="Отклонить возврат?" onConfirm={() => handleAction(record.id, 'reject')}>
              <Button danger size="small" icon={<CloseOutlined />} />
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <Card 
      bordered={false} 
      style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} 
      styles={{ body: { padding: 0 }, header: { borderBottom: 'none', padding: '16px 24px 0' } }}
    >
      <Table 
        columns={columns} 
        dataSource={returns} 
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
        style={{ padding: "0 24px 24px 24px" }}
      />
    </Card>
  );
}
