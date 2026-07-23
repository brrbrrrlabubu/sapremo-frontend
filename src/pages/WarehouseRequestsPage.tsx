import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, Typography, Table, Tag, Button, Select, Modal, Form,
  DatePicker, Input, App, Popconfirm,
} from 'antd';
import { PlusOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons';
import { PALETTE } from '../theme/tokens';
import { WarehouseOrderService } from '../services/warehouseOrder.service';
import { getWarehouseOrderStatus, canCancelWarehouseOrder } from '../constants/orderStatuses';
import { MobileCard, MobileCardList } from '../components/MobileCard';
import { useResponsiveTable } from '../hooks/useResponsiveTable';
import type { WarehouseOrder } from '../types/api.types';

const { Title } = Typography;
const { TextArea } = Input;

// ─── Плоская строка для таблицы ───────────────────────────────────────────────
interface FlatOrderRow {
  id: string;
  orderId: string | undefined;
  req: string;
  date: string;
  product: string;
  quantity: number;
  note: string;
  status: string;
}

function flattenOrders(orders: WarehouseOrder[]): FlatOrderRow[] {
  const rows: FlatOrderRow[] = [];

  for (const order of orders) {
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        rows.push({
          id: item.id ?? `${order.id}-${Math.random()}`,
          orderId: order.id,
          req: order.id ? order.id.slice(0, 8) : 'WREQ-XXX',
          date: new Date(order.created_at || Date.now()).toLocaleDateString('ru-RU'),
          product:
            item.productId || item.product_id
              ? `Товар ${(item.productId || item.product_id)?.slice(0, 8)}`
              : '—',
          quantity: item.qty ?? 0,
          note: order.comment || '—',
          status: order.status || 'pending',
        });
      }
    } else {
      rows.push({
        id: order.id ?? Math.random().toString(),
        orderId: order.id,
        req: order.id ? order.id.slice(0, 8) : 'WREQ-XXX',
        date: new Date(order.created_at || Date.now()).toLocaleDateString('ru-RU'),
        product: '—',
        quantity: 0,
        note: order.comment || '—',
        status: order.status || 'pending',
      });
    }
  }

  return rows;
}

// ─── Компонент ────────────────────────────────────────────────────────────────
export default function WarehouseRequestsPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { isMobile, tableScroll } = useResponsiveTable(750);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FlatOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const pageSize = 10;

  const loadData = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const res = await WarehouseOrderService.getOrders(page, pageSize);
        setTotal(res.count);
        setData(flattenOrders(res.results));
      } catch (err) {
        console.error('[WarehouseRequestsPage] loadData:', err);
        message.error(t('warehouseRequests.errorLoading'));
      } finally {
        setLoading(false);
      }
    },
    [message, t]
  );

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, loadData]);

  // ── Отмена заявки ─────────────────────────────────────────────────────────
  const handleCancel = useCallback(
    async (orderId: string | undefined) => {
      if (!orderId) {
        message.warning('ID заявки не определён');
        return;
      }
      try {
        await WarehouseOrderService.cancelOrder(orderId);
        message.success(t('warehouseRequests.cancelSuccess', 'Заявка отменена'));
        loadData(currentPage);
      } catch (err) {
        console.error('[WarehouseRequestsPage] handleCancel:', err);
        message.error(t('warehouseRequests.cancelError', 'Не удалось отменить заявку'));
      }
    },
    [message, t, loadData, currentPage]
  );

  // ── Создание заявки ───────────────────────────────────────────────────────
  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      await WarehouseOrderService.createOrder({
        comment: values.note as string,
        items: [
          {
            qty: Number(values.quantity),
          },
        ],
      });
      message.success(t('common.saved'));
      setIsModalOpen(false);
      form.resetFields();
      loadData(currentPage);
    } catch {
      message.error(t('common.error'));
    }
  };

  // ── Фильтрация ────────────────────────────────────────────────────────────
  const filteredData = statusFilter
    ? data.filter((row) => row.status.toLowerCase() === statusFilter.toLowerCase())
    : data;

  // ── Колонки ───────────────────────────────────────────────────────────────
  const columns = [
    {
      title: t('warehouseRequests.requestNoCol'),
      dataIndex: 'req',
      key: 'req',
      width: 110,
      render: (text: string) => <a style={{ color: PALETTE.primary }}>{text}</a>,
    },
    { title: t('warehouseRequests.dateCol'), dataIndex: 'date', key: 'date', width: 110 },
    { title: t('warehouseRequests.productCol'), dataIndex: 'product', key: 'product' },
    {
      title: t('warehouseRequests.quantityCol'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    { title: t('warehouseRequests.noteCol'), dataIndex: 'note', key: 'note' },
    {
      title: t('warehouseRequests.statusCol'),
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: string) => {
        const cfg = getWarehouseOrderStatus(status);
        return (
          <Tag color={cfg.color} style={{ borderRadius: 4, padding: '2px 8px' }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: t('warehouseRequests.actionCol'),
      key: 'action',
      width: 110,
      render: (_: unknown, record: FlatOrderRow) => {
        const canCancel = canCancelWarehouseOrder(record.status);
        return canCancel ? (
          <Popconfirm
            title={t('warehouseRequests.cancelConfirm', 'Отменить заявку?')}
            description={t('warehouseRequests.cancelConfirmDesc', 'Это действие необратимо.')}
            onConfirm={() => handleCancel(record.orderId)}
            okText={t('common.yes', 'Да')}
            cancelText={t('common.no', 'Нет')}
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              icon={<StopOutlined />}
              style={{ borderRadius: 6 }}
            >
              {t('warehouseRequests.cancelBtn')}
            </Button>
          </Popconfirm>
        ) : (
          <Button size="small" disabled style={{ borderRadius: 6, color: '#bfbfbf' }}>
            {t('warehouseRequests.cancelBtn')}
          </Button>
        );
      },
    },
  ];

  // ── Мобильные карточки ────────────────────────────────────────────────────
  const renderMobileCard = (row: FlatOrderRow) => {
    const cfg = getWarehouseOrderStatus(row.status);
    const canCancel = canCancelWarehouseOrder(row.status);

    return (
      <MobileCard
        key={row.id}
        fields={[
          { label: '№ заявки', value: row.req, isPrimary: true },
          { label: t('warehouseRequests.dateCol'), value: row.date },
          { label: t('warehouseRequests.productCol'), value: row.product },
          { label: t('warehouseRequests.quantityCol'), value: `${row.quantity} шт.` },
          {
            label: t('warehouseRequests.statusCol'),
            value: cfg.label,
            tagColor: cfg.color,
          },
          ...(row.note !== '—' ? [{ label: t('warehouseRequests.noteCol'), value: row.note }] : []),
        ]}
        actions={
          canCancel ? (
            <Popconfirm
              title="Отменить заявку?"
              onConfirm={() => handleCancel(row.orderId)}
              okText="Да"
              cancelText="Нет"
              okButtonProps={{ danger: true }}
            >
              <Button danger size="small" icon={<StopOutlined />} style={{ borderRadius: 6 }}>
                {t('warehouseRequests.cancelBtn')}
              </Button>
            </Popconfirm>
          ) : undefined
        }
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Заголовок */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Title level={2} style={{ margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 700 }}>
            {t('warehouseRequests.title')}
          </Title>
          <Select
            placeholder={t('warehouseRequests.statusFilter')}
            style={{ width: 150 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'pending',   label: 'Отправлено' },
              { value: 'accepted',  label: 'Принято заводом' },
              { value: 'completed', label: 'Выдано' },
              { value: 'cancelled', label: 'Отменено' },
            ]}
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            icon={<ReloadOutlined />}
            size={isMobile ? 'middle' : 'large'}
            style={{ borderRadius: 6 }}
            onClick={() => loadData(currentPage)}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size={isMobile ? 'middle' : 'large'}
            style={{ borderRadius: 6 }}
            onClick={() => setIsModalOpen(true)}
          >
            {isMobile ? '' : t('warehouseRequests.createRequest')}
          </Button>
        </div>
      </div>

      {/* Таблица / карточки */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: 0 } }}
      >
        {isMobile ? (
          <MobileCardList
            data={filteredData}
            loading={loading}
            renderCard={renderMobileCard}
            emptyText={t('common.noData')}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            pagination={{
              current: currentPage,
              total,
              pageSize,
              showSizeChanger: false,
              onChange: setCurrentPage,
              showTotal: (tot, range) =>
                `Показано ${range[0]}-${range[1]} из ${tot.toLocaleString()}`,
            }}
            rowKey="id"
            scroll={tableScroll}
            style={{ padding: 24 }}
          />
        )}
      </Card>

      {/* Модал */}
      <Modal
        title={t('warehouseRequests.modalTitle')}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        footer={[
          <Button key="back" onClick={() => { setIsModalOpen(false); form.resetFields(); }}>
            {t('common.cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.validateFields().then(handleSubmit)}>
            {t('warehouseRequests.submitRequest')}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label={t('warehouseRequests.dateCol')}
            name="date"
            rules={[{ required: true, message: t('common.selectDate') }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>

          <Form.Item
            label={t('common.quantity')}
            name="quantity"
            rules={[
              { required: true, message: t('common.enterQuantity') },
              {
                validator: (_, v) =>
                  Number(v) > 0
                    ? Promise.resolve()
                    : Promise.reject('Количество должно быть больше 0'),
              },
            ]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item label={t('common.note')} name="note">
            <TextArea placeholder={t('common.optional')} rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
