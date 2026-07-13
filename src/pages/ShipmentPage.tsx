import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, Tabs, Tag, Typography, Space, Card, App } from "antd";
import { PlusOutlined, TruckOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { ShipmentService } from "../services/shipment.service";
import type { Shipment } from "../types/api.types";
import { useUIStore } from "../store/useUIStore";
import { useUserStore } from "../store/useUserStore";

const { Title } = Typography;

export default function ShipmentsPage() {
  const { t } = useTranslation();
  const { theme } = useUIStore();
  const isDark = theme === "dark";
  const { notification } = App.useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await ShipmentService.getShipments();
      setShipments(data.results || []);
    } catch (error) {
      notification.error({ message: t('errors.fetchFailed', 'Ошибка загрузки') });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleCreate = async (values: any) => {
    try {
      setLoading(true);
      await ShipmentService.createShipment({
        shipment_date: values.date.format("YYYY-MM-DD"),
        warehouse_id: values.warehouse_id,
        truck_number: values.truck_number,
        truck_driver: values.truck_driver,
        created_by: useUserStore.getState().user?.id || 'admin',
      });
      setIsModalOpen(false);
      form.resetFields();
      notification.success({ message: t('shipments.created') });
      fetchShipments();
    } catch (error) {
      notification.error({ message: t('errors.createFailed', 'Ошибка создания') });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id: string | undefined, newStatus: Shipment["status"]) => {
    if (!id) return;
    try {
      setLoading(true);
      await ShipmentService.updateStatus(id, newStatus);
      notification.success({ message: t('actions.edit') });
      fetchShipments();
    } catch (error) {
      notification.error({ message: t('errors.updateFailed', 'Ошибка обновления') });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: t('dashboard.truck_number'), dataIndex: "truck_number", key: "truck_number", render: (text: string) => <Space><TruckOutlined /> <strong>{text}</strong></Space> },
    { title: t('common.date'), dataIndex: "shipment_date", key: "shipment_date", render: (date: string) => <Space><CalendarOutlined /> {date}</Space> },
    { title: t('shipments.warehouse_id'), dataIndex: "warehouse_id", key: "warehouse_id" },
    { title: t('shipments.truck_driver'), dataIndex: "truck_driver", key: "truck_driver", render: (text: string) => <Space><UserOutlined />{text}</Space> },
    { title: t('dashboard.status'), dataIndex: "status", key: "status", render: (status: Shipment["status"]) => {
        const config: any = {
          shipped: { color: "success", label: t('status.shipped') },
          pending: { color: "warning", label: t('status.pending') },
          cancelled: { color: "error", label: t('status.cancelled') },
        };
        const current = config[status] || config.pending;
        return <Tag color={current.color}>{current.label}</Tag>;
      }
    },
    { title: t('common.actions'), key: "actions", render: (_: any, record: Shipment) => (
        <Space size="small">
          {record.status === "pending" && (
            <>
              <Button type="link" onClick={() => handleChangeStatus(record.id, "shipped")}>{t('shipments.accept')}</Button>
              <Button type="link" danger onClick={() => handleChangeStatus(record.id, "cancelled")}>{t('shipments.cancel')}</Button>
            </>
          )}
        </Space>
      )
    }
  ];

  const renderTable = (statusFilter?: string) => (
    <Table loading={loading} dataSource={statusFilter ? shipments.filter(s => s.status === statusFilter) : shipments} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 'max-content' }} />
  );

  return (
    
    <div>
      <div style={{ 
        color: isDark ? "#ffffff" : "#000000", 
        background: isDark ? "#1f1f1f" : "#ffffff" 
      }}>
        Контент
      </div>
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }}>
        <Title level={3}>{t('shipments.title')}</Title>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>{t('shipments.create')}</Button>
        </div>
      </Card>

      <Tabs defaultActiveKey="all" items={[
        { key: "all", label: t('shipments.all'), children: renderTable() },
        { key: "pending", label: t('shipments.pendingTab'), children: renderTable("pending") },
        { key: "shipped", label: t('shipments.shippedTab'), children: renderTable("shipped") },
      ]} />

      <Modal title={t('shipments.createModalTitle')} open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="date" label={t('common.date')} initialValue={dayjs()}><DatePicker style={{ width: "100%" }} /></Form.Item>
          <Form.Item name="warehouse_id" label={t('shipments.warehouse_id')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="truck_number" label={t('shipments.truck_number')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="truck_driver" label={t('shipments.truck_driver')} rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}