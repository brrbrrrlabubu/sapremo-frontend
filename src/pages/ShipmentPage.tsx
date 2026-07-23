import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card, Typography, Table, Tag, Button, Select, Space, App,
  Form, Input, Row, Col, Popconfirm,
} from 'antd';
import {
  FilePdfOutlined,
  PrinterOutlined,
  CheckOutlined,
  SendOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { PALETTE } from '../theme/tokens';
import { ShipmentService } from '../services/shipment.service';
import { getShipmentStatus, canCancelWarehouseOrder } from '../constants/orderStatuses';
import { MobileCard, MobileCardList } from '../components/MobileCard';
import { useResponsiveTable } from '../hooks/useResponsiveTable';
import type { Shipment } from '../types/api.types';
import { useUserStore } from '../store/useUserStore';
import { UserRole } from '../types/enums';

const { Title } = Typography;

// ─── Плоская строка для таблицы / карточки ───────────────────────────────────
interface FlatShipmentRow {
  id: string;
  shipmentId: string | undefined;
  date: string;
  request: string;
  car: string;
  product: string;
  status: string;
}

function flattenShipments(shipments: Shipment[]): FlatShipmentRow[] {
  const rows: FlatShipmentRow[] = [];
  for (const s of shipments) {
    if (s.items && s.items.length > 0) {
      for (const item of s.items) {
        rows.push({
          id: item.id ?? `${s.id}-${Math.random()}`,
          shipmentId: s.id,
          date: new Date(s.shipment_date).toLocaleDateString('ru-RU'),
          request: s.id ? s.id.slice(0, 8) : 'REQ-XXX',
          car: s.truck_number,
          product: item.product_id ? `Товар ${item.product_id.slice(0, 8)}` : '—',
          status: s.status || 'pending',
        });
      }
    } else {
      rows.push({
        id: s.id ?? Math.random().toString(),
        shipmentId: s.id,
        date: new Date(s.shipment_date).toLocaleDateString('ru-RU'),
        request: s.id ? s.id.slice(0, 8) : 'REQ-XXX',
        car: s.truck_number,
        product: '—',
        status: s.status || 'pending',
      });
    }
  }
  return rows;
}

// ─── Компонент ────────────────────────────────────────────────────────────────
export default function ShipmentPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const { isMobile, tableScroll } = useResponsiveTable(850);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FlatShipmentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const pageSize = 10;

  const { user } = useUserStore();
  const isFactory = user?.role === UserRole.Factory;
  const [form] = Form.useForm();

  const loadData = useCallback(
    async (page: number) => {
      if (isFactory) return;
      setLoading(true);
      try {
        const res = await ShipmentService.getShipments(page, pageSize);
        setTotal(res.count);
        setData(flattenShipments(res.results));
      } catch (err) {
        console.error('[ShipmentPage] loadData:', err);
        message.error(t('shipment.errorLoading'));
      } finally {
        setLoading(false);
      }
    },
    [isFactory, message, t]
  );

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, loadData]);

  const handleCancel = useCallback(
    async (shipmentId: string | undefined) => {
      if (!shipmentId) return;
      try {
        await ShipmentService.cancelShipment(shipmentId);
        message.success('Отгрузка отменена');
        loadData(currentPage);
      } catch {
        message.error('Не удалось отменить отгрузку');
      }
    },
    [message, loadData, currentPage]
  );

  const filteredData = statusFilter
    ? data.filter((r) => r.status.toLowerCase() === statusFilter)
    : data;

  // ── Колонки ───────────────────────────────────────────────────────────────
  const columns = [
    {
      title: t('shipment.dateCol'),
      dataIndex: 'date',
      key: 'date',
      width: 110,
    },
    {
      title: t('shipment.requestCol'),
      dataIndex: 'request',
      key: 'request',
      width: 110,
      render: (text: string) => <a style={{ color: PALETTE.primary }}>{text}</a>,
    },
    {
      title: t('shipment.carCol'),
      dataIndex: 'car',
      key: 'car',
      render: (text: string) => (
        <span
          style={{
            background: 'var(--color-bg-layout, #f5f5f5)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '13px',
            color: 'var(--color-text-secondary, #595959)',
            border: '1px solid var(--color-border, #e8e8e8)',
          }}
        >
          {text}
        </span>
      ),
    },
    { title: t('shipment.productCol'), dataIndex: 'product', key: 'product' },
    {
      title: t('shipment.statusCol'),
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        const cfg = getShipmentStatus(status);
        return (
          <Tag color={cfg.color} style={{ borderRadius: '4px', padding: '2px 8px' }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: t('shipment.actionsCol'),
      key: 'action',
      width: 210,
      render: (_: unknown, record: FlatShipmentRow) => {
        const canCancel = canCancelWarehouseOrder(record.status);
        return (
          <Space size="small">
            <Button icon={<FilePdfOutlined />} size="small" style={{ borderRadius: '6px' }}>
              {t('shipment.pdf')}
            </Button>
            <Button icon={<PrinterOutlined />} size="small" style={{ borderRadius: '6px' }}>
              {t('shipment.print')}
            </Button>
            {canCancel ? (
              <Popconfirm
                title="Отменить отгрузку?"
                onConfirm={() => handleCancel(record.shipmentId)}
                okText="Да"
                cancelText="Нет"
                okButtonProps={{ danger: true }}
              >
                <Button danger size="small" icon={<StopOutlined />} style={{ borderRadius: '6px' }} />
              </Popconfirm>
            ) : (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                style={{ borderRadius: '6px' }}
              >
                {t('shipment.issue')}
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  // ── Мобильные карточки ────────────────────────────────────────────────────
  const renderMobileCard = (row: FlatShipmentRow) => {
    const cfg = getShipmentStatus(row.status);
    const canCancel = canCancelWarehouseOrder(row.status);

    return (
      <MobileCard
        key={row.id}
        fields={[
          { label: t('shipment.requestCol'), value: row.request, isPrimary: true },
          { label: t('shipment.dateCol'), value: row.date },
          { label: t('shipment.carCol'), value: row.car },
          { label: t('shipment.productCol'), value: row.product },
          { label: t('shipment.statusCol'), value: cfg.label, tagColor: cfg.color },
        ]}
        actions={
          <Space size="small">
            <Button icon={<FilePdfOutlined />} size="small" style={{ borderRadius: '6px' }}>
              PDF
            </Button>
            {canCancel ? (
              <Popconfirm
                title="Отменить?"
                onConfirm={() => handleCancel(row.shipmentId)}
                okText="Да"
                cancelText="Нет"
                okButtonProps={{ danger: true }}
              >
                <Button danger size="small" icon={<StopOutlined />} style={{ borderRadius: '6px' }} />
              </Popconfirm>
            ) : (
              <Button type="primary" size="small" icon={<CheckOutlined />} style={{ borderRadius: '6px' }}>
                {t('shipment.issue')}
              </Button>
            )}
          </Space>
        }
      />
    );
  };

  // ── Factory-view: форма создания отгрузки ─────────────────────────────────
  if (isFactory) {
    return (
      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
        <Title level={4} style={{ marginTop: 0, marginBottom: 24 }}>
          Оформление отгрузки на склад
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await ShipmentService.createShipment({
                warehouse_id: values.warehouse,
                shipment_date: new Date().toISOString().slice(0, 10),
                truck_number: values.truck,
                truck_driver: values.driver ?? '—',
                created_by: user?.id ?? '',
              });
              message.success('Отгрузка успешно создана!');
              form.resetFields();
            } catch {
              message.error('Не удалось создать отгрузку');
            }
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Склад назначения"
                name="warehouse"
                rules={[{ required: true, message: 'Выберите склад' }]}
              >
                <Select placeholder="Выберите склад">
                  <Select.Option value="1">Бишкек - Главный</Select.Option>
                  <Select.Option value="2">Ош - Региональный</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Номер машины"
                name="truck"
                rules={[{ required: true, message: 'Укажите машину' }]}
              >
                <Input placeholder="Например: B 1234 AB" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Товар"
                name="product"
                rules={[{ required: true, message: 'Выберите товар' }]}
              >
                <Select placeholder="Выберите товар">
                  <Select.Option value="p1">Пломбир «Сливочный»</Select.Option>
                  <Select.Option value="p2">Эскимо</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Количество (шт/кор)"
                name="qty"
                rules={[{ required: true, message: 'Укажите количество' }]}
              >
                <Input type="number" placeholder="Например: 100" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Комментарий" name="comment">
                <Input.TextArea rows={3} placeholder="Необязательный комментарий..." />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SendOutlined />}
                  size="large"
                  style={{ borderRadius: '6px' }}
                >
                  Отправить отгрузку
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }

  // ── Warehouse-view: таблица / карточки ────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 12,
        }}
      >
        <Title level={2} style={{ margin: 0, fontSize: isMobile ? 22 : 28, fontWeight: 700 }}>
          {t('shipment.title', 'Отгрузки')}
        </Title>
        <Select
          placeholder={t('shipment.statusFilter')}
          style={{ width: 160 }}
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'pending', label: 'В ожидании' },
            { value: 'shipped', label: 'Отгружено' },
            { value: 'cancelled', label: 'Отменено' },
          ]}
        />
      </div>

      <Card
        bordered={false}
        style={{ borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: 0 } }}
      >
        {isMobile ? (
          <MobileCardList
            data={filteredData}
            loading={loading}
            renderCard={renderMobileCard}
            emptyText={t('common.noData', 'Нет данных')}
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
              onChange: (page) => setCurrentPage(page),
              showTotal: (tot, range) =>
                `Показано ${range[0]}-${range[1]} из ${tot.toLocaleString()}`,
            }}
            rowKey="id"
            scroll={tableScroll}
            style={{ padding: '0 24px 24px' }}
          />
        )}
        {isMobile && (
          <div style={{ padding: '8px 16px 16px', display: 'flex', justifyContent: 'center' }}>
            <Select
              value={currentPage}
              onChange={setCurrentPage}
              style={{ width: 120 }}
              options={Array.from({ length: Math.ceil(total / pageSize) || 1 }, (_, i) => ({
                value: i + 1,
                label: `Стр. ${i + 1}`,
              }))}
            />
          </div>
        )}
      </Card>
    </div>
  );
}