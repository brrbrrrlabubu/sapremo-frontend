import { useState, useEffect, type ReactNode } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, Tabs, Tag, Typography, Space, Card, Row, Col, App } from "antd";
import { PlusOutlined, TruckOutlined, CalendarOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { ShipmentService } from "../services/shipment.service";
import { WarehouseService, type WarehouseStat } from "../services/warehouse.service";
import type { Shipment } from "../types/api.types";
import { UserRole, ShipmentStatus } from "../types/enums";
import { useUIStore } from "../store/useUIStore";
import { useUserStore } from "../store/useUserStore";
import { PALETTE, themed } from "../theme/tokens";

const { Title, Text } = Typography;

export default function ShipmentsPage() {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const currentUserRole = user?.role;
  const canManage = currentUserRole === UserRole.Admin || currentUserRole === UserRole.Manager;

  const { theme } = useUIStore();
  const isDark = theme === "dark";
  const tTheme = themed(isDark);

  const { notification } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await ShipmentService.getShipments();
      setShipments(data.results);
    } catch (error) {
      notification.error({
        message: t('errors.fetchFailed', 'Failed to fetch shipments'),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await WarehouseService.getStats();
      setWarehouses(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchWarehouses();
  }, []);

  const handleCreate = async (values: { date: dayjs.Dayjs; warehouse_id: string; truck_number: string; truck_driver: string }) => {
    try {
      setLoading(true);
      await ShipmentService.createShipment({
        shipment_date: values.date.format("YYYY-MM-DD"),
        warehouse_id: values.warehouse_id,
        truck_number: values.truck_number,
        truck_driver: values.truck_driver,
        created_by: useUserStore.getState().user?.id || '',
      });

      setIsModalOpen(false);
      form.resetFields();

      notification.success({
        message: t('shipments.createModalTitle'),
        description: t('status.pending', 'Pending'),
      });
      fetchShipments();
    } catch (error) {
      notification.error({
        message: t('errors.createFailed', 'Failed to create shipment'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id: string | undefined, newStatus: Shipment["status"]) => {
    if (!id) return;
    try {
      setLoading(true);
      await ShipmentService.updateStatus(id, newStatus);
      notification.success({
        message: t('actions.edit'),
      });
      fetchShipments();
    } catch (error) {
      notification.error({
        message: t('errors.updateFailed', 'Failed to update status'),
      });
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    {
      title: t('shipments.truck_number', 'Номер машины'),
      dataIndex: "truck_number",
      key: "truck_number",
      render: (text: string) => (
        <Space>
          <TruckOutlined style={{ color: PALETTE.primary }} />
          <strong style={{ color: tTheme.text }}>{text}</strong>
        </Space>
      )
    },
    {
      title: t('common.date'),
      dataIndex: "shipment_date",
      key: "shipment_date",
      render: (date: string) => (
        <Space style={{ color: tTheme.textSecondary }}>
          <CalendarOutlined style={{ color: tTheme.textTertiary }} />
          {date}
        </Space>
      )
    },
    { title: t('shipments.warehouse_id', 'Склад назначения'), dataIndex: "warehouse_id", key: "warehouse_id" },
    {
      title: t('shipments.truck_driver', 'Водитель'),
      dataIndex: "truck_driver",
      key: "truck_driver",
      render: (text: string) => (
        <Space style={{ color: tTheme.text }}>
          <UserOutlined />{text}
        </Space>
      )
    },
    {
      title: t('dashboard.status'),
      dataIndex: "status",
      key: "status",
      render: (status: Shipment["status"]) => {
        const config: Record<string, { bg: string, text: string, icon: ReactNode, label: string }> = {
          [ShipmentStatus.Shipped]: { bg: tTheme.bgSuccess, text: PALETTE.success, icon: <CheckCircleOutlined />, label: t('status.shipped') },
          [ShipmentStatus.Pending]: { bg: tTheme.bgWarning, text: PALETTE.warning, icon: <CloseCircleOutlined />, label: t('status.pending', 'Ожидает обработки') },
          [ShipmentStatus.Cancelled]: { bg: tTheme.bgError, text: PALETTE.error, icon: <CloseCircleOutlined />, label: t('status.cancelled', 'Cancelled') },
        };
        const current = config[status] || config[ShipmentStatus.Pending];
        return <Tag style={{ backgroundColor: current.bg, color: current.text, borderColor: isDark ? "transparent" : undefined, borderRadius: "4px" }}>{current.icon} {current.label}</Tag>;
      }
    },
    {
      title: t('common.actions'),
      key: "actions",
      render: (_: any, record: Shipment) => {
        const handlePrint = (record: Shipment) => {
          const win = window.open('', '_blank', 'width=800,height=600');
          if (win) {
            win.document.write(`<html><body><h1>${record.truck_number}</h1><p>${t('shipments.warehouse_id', 'Склад назначения')}: ${record.warehouse_id}</p><p>${t('shipments.truck_driver', 'Водитель')}: ${record.truck_driver}</p><script>window.onload = function() { window.print(); };</script></body></html>`);
            win.document.close();
          }
        };

        return (
          <Space size="small">
            <Button type="text" icon={<PrinterOutlined style={{ color: tTheme.textSecondary }} />} onClick={() => handlePrint(record)} />
            {record.status === ShipmentStatus.Pending && (
              <Button type="text" style={{ color: PALETTE.success }} icon={<CheckCircleOutlined />} disabled={!canManage} onClick={() => handleChangeStatus(record.id, ShipmentStatus.Shipped)}>{t('shipments.accept')}</Button>
            )}
            {record.status === ShipmentStatus.Pending && (
              <Button type="text" style={{ color: PALETTE.primary }} icon={<CloseCircleOutlined />} disabled={!canManage} onClick={() => handleChangeStatus(record.id, ShipmentStatus.Cancelled)}>{t('shipments.cancel', 'Cancel')}</Button>
            )}
          </Space>
        );
      },
    },
  ];

  const renderTable = (statusFilter?: string) => {
    const data = statusFilter ? shipments.filter(s => s.status === statusFilter) : shipments;
    return <Table loading={loading} dataSource={data} columns={columns} rowKey="id" pagination={false} style={{ marginTop: 16 }} scroll={{ x: 'max-content' }} />;
  };

  return (
    <div>
      <Card
        bordered={true}
        style={{ marginBottom: 24, borderRadius: "4px" }}
        styles={{ body: { padding: "16px 24px" } }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title level={3} style={{ color: PALETTE.primary, margin: 0, fontSize: "20px", fontWeight: 600 }}> {t('shipments.title')}</Title>
            <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block", color: tTheme.textSecondary }}>
              {t('shipments.subtitle')}
            </Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} disabled={!canManage} style={{ height: "36px", flexShrink: 0 }}>{t('shipments.create')}</Button>
        </div>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col xs={24} sm={8}>
            <div style={{ background: tTheme.bgPrimary, padding: "12px", borderRadius: "4px", border: `1px solid ${tTheme.borderPrimary}` }}>
              <Text type="secondary" style={{ color: tTheme.textSecondary }}>{t('shipments.totalDocs')}</Text>
              <div style={{ fontSize: "20px", fontWeight: 600, color: PALETTE.primary }}>{shipments.length}</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ background: tTheme.bgWarning, padding: "12px", borderRadius: "4px", border: `1px solid ${tTheme.borderWarning}` }}>
              <Text type="secondary" style={{ color: tTheme.textSecondary }}>{t('shipments.pending', 'В ожидании')}</Text>
              <div style={{ fontSize: "20px", fontWeight: 600, color: PALETTE.warning }}>{shipments.filter(s => s.status === ShipmentStatus.Pending).length}</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ background: tTheme.bgSuccess, padding: "12px", borderRadius: "4px", border: `1px solid ${tTheme.borderSuccess}` }}>
              <Text type="secondary" style={{ color: tTheme.textSecondary }}>{t('shipments.received')}</Text>
              <div style={{ fontSize: "20px", fontWeight: 600, color: PALETTE.success }}>{shipments.filter(s => s.status === ShipmentStatus.Shipped).length}</div>
            </div>
          </Col>
        </Row>
      </Card>

      <Tabs defaultActiveKey="all" items={[
        { key: "all", label: t('shipments.all'), children: renderTable() },
        { key: "pending", label: t('shipments.pendingTab', 'В ожидании'), children: renderTable("pending") },
        { key: "shipped", label: t('shipments.shippedTab'), children: renderTable("shipped") },
      ]} />

      <Modal title={t('shipments.createModalTitle')} open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)} confirmLoading={loading}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="date" label={t('common.date')} initialValue={dayjs()}><DatePicker style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="warehouse_id" label={t('shipments.warehouse', 'Warehouse')} rules={[{ required: true }]}>
            <Select placeholder={t('warehouses.typePlaceholder', 'Select from list')}>
              {warehouses.map((w) => (
                <Select.Option key={w.id || w.warehouse_id} value={w.id || w.warehouse_id}>
                  {w.name || w.warehouse_name || w.id || w.warehouse_id}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="truck_number" label={t('shipments.truck_number', 'Номер машины')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="truck_driver" label={t('shipments.truck_driver', 'Водитель')} rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}