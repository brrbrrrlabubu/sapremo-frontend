import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, Tabs, Tag, Typography, Space, Card, Row, Col, App } from "antd";
import { PlusOutlined, TruckOutlined, CalendarOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { ShipmentService } from "../services/shipment.service";
import type { Shipment } from "../types/api.types";
import { useUIStore } from "../store/useUIStore";
import { useUserStore } from "../store/useUserStore";

const { Title, Text } = Typography;

export default function ShipmentsPage() {
  const { t } = useTranslation();
  const currentUserRole = "admin"; 
  const canManage = currentUserRole === "admin" || currentUserRole === "manager";

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
      setShipments(data.results);
    } catch (error) {
      notification.error({
        message: t('errors.fetchFailed', 'Failed to fetch shipments'),
      });
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
      title: t('dashboard.truck_number', 'Truck No.'), 
      dataIndex: "truck_number", 
      key: "truck_number", 
      render: (text: string) => (
        <Space>
          <TruckOutlined style={{ color: "#1890ff" }} />
          <strong style={{ color: isDark ? "rgba(255, 255, 255, 0.85)" : "#000000" }}>{text}</strong>
        </Space>
      ) 
    },
    { 
      title: t('common.date'), 
      dataIndex: "shipment_date", 
      key: "shipment_date", 
      render: (date: string) => (
        <Space style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "inherit" }}>
          <CalendarOutlined style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0,0,0,0.45)" }} />
          {date}
        </Space>
      ) 
    },
    { title: t('shipments.warehouse_id', 'Warehouse ID'), dataIndex: "warehouse_id", key: "warehouse_id" },
    { 
      title: t('shipments.truck_driver', 'Truck Driver'), 
      dataIndex: "truck_driver", 
      key: "truck_driver", 
      render: (text: string) => (
        <Space style={{ color: isDark ? "rgba(255, 255, 255, 0.85)" : "inherit" }}>
          <UserOutlined />{text}
        </Space>
      ) 
    },
    { 
      title: t('dashboard.status'), 
      dataIndex: "status", 
      key: "status", 
      render: (status: Shipment["status"]) => {
        const config: any = {
          shipped: { bg: isDark ? "#142518" : "#efffe2", text: isDark ? "#52c41a" : "#52C41A", icon: <CheckCircleOutlined />, label: t('status.shipped') },
          pending: { bg: isDark ? "#2b2111" : "#fff6da", text: isDark ? "#faad14" : "#FAAD14", icon: <CloseCircleOutlined />, label: t('status.pending', 'Pending') },
          cancelled: { bg: isDark ? "#2c1517" : "#ffdfde", text: isDark ? "#ff4d4f" : "#F5222D", icon: <CloseCircleOutlined />, label: t('status.cancelled', 'Cancelled') },
        };
        const current = config[status] || config.pending;
        return <Tag style={{ backgroundColor: current.bg, color: current.text, borderColor: isDark ? "transparent" : undefined, borderRadius: "4px" }}>{current.icon} {current.label}</Tag>;
      }
    },
    {
      title: t('common.actions'),
      key: "actions",
      render: (_: any, record: Shipment) => (
        <Space size="small">
          <Button type="text" icon={<PrinterOutlined style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "inherit" }} />} onClick={() => {
            const win = window.open('', '_blank', 'width=800,height=600');
            if (win) {
              win.document.write(`<html><body><h1>${record.truck_number}</h1><p>${t('shipments.warehouse_id', 'Warehouse ID')}: ${record.warehouse_id}</p><p>${t('shipments.truck_driver', 'Driver')}: ${record.truck_driver}</p><script>window.onload = function() { window.print(); };</script></body></html>`);
              win.document.close();
            }
          }} />
          {record.status === "pending" && (
            <Button type="text" style={{ color: "#52c41a" }} icon={<CheckCircleOutlined />} disabled={!canManage} onClick={() => handleChangeStatus(record.id, "shipped")}>{t('shipments.accept')}</Button>
          )}
          {record.status === "pending" && (
            <Button type="text" style={{ color: "#1890FF" }} icon={<CloseCircleOutlined />} disabled={!canManage} onClick={() => handleChangeStatus(record.id, "cancelled")}>{t('shipments.cancel', 'Cancel')}</Button>
          )}

        </Space>
      ),
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
            <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px", fontWeight: 600 }}> {t('shipments.title')}</Title>
            <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block", color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)" }}>
              {t('shipments.subtitle')}
            </Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} disabled={!canManage} style={{ height: "36px", flexShrink: 0 }}>{t('shipments.create')}</Button>
        </div>
        
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col xs={24} sm={8}>
            <div style={{ background: isDark ? "#111a2c" : "#f0f9ff", padding: "12px", borderRadius: "4px", border: `1px solid ${isDark ? "#152542" : "#bae7ff"}` }}>
              <Text type="secondary" style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0,0,0,0.45)" }}>{t('shipments.totalDocs')}</Text>
              <div style={{ fontSize: "20px", fontWeight: 600, color: "#1890ff" }}>{shipments.length}</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ background: isDark ? "#2b2111" : "#fffbe6", padding: "12px", borderRadius: "4px", border: `1px solid ${isDark ? "#4d3e1f" : "#ffe58f"}` }}>
              <Text type="secondary" style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0,0,0,0.45)" }}>{t('shipments.pending', 'Pending')}</Text>
              <div style={{ fontSize: "20px", fontWeight: 600, color: "#faad14" }}>{shipments.filter(s => s.status === "pending").length}</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ background: isDark ? "#142518" : "#f6ffed", padding: "12px", borderRadius: "4px", border: `1px solid ${isDark ? "#1b3d22" : "#b7eb8f"}` }}>
              <Text type="secondary" style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0,0,0,0.45)" }}>{t('shipments.received')}</Text>
              <div style={{ fontSize: "20px", fontWeight: 600, color: "#52c41a" }}>{shipments.filter(s => s.status === "shipped").length}</div>
            </div>
          </Col>
        </Row>
      </Card>

      <Tabs defaultActiveKey="all" items={[
        { key: "all", label: t('shipments.all'), children: renderTable() },
        { key: "pending", label: t('shipments.pendingTab', 'Pending'), children: renderTable("pending") },
        { key: "shipped", label: t('shipments.shippedTab'), children: renderTable("shipped") },
      ]} />

      <Modal title={t('shipments.createModalTitle')} open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)} confirmLoading={loading}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="date" label={t('common.date')} initialValue={dayjs()}><DatePicker style={{ width: "100%" }} /></Form.Item>
          {/* Typically warehouse id should come from a Warehouse API endpoint, but using string input for now as placeholder for real IDs */}
          <Form.Item name="warehouse_id" label={t('shipments.warehouse_id', 'Warehouse ID')} rules={[{ required: true }]}><Input placeholder="UUID" /></Form.Item>
          <Form.Item name="truck_number" label={t('shipments.truck_number', 'Truck Number')} rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="truck_driver" label={t('shipments.truck_driver', 'Truck Driver')} rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}