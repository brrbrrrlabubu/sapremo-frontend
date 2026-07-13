import { useState, useEffect } from "react";
import { Table, Skeleton, Empty, Space, Tag, Typography, Card, App } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useUIStore } from "../store/useUIStore";
import { useTranslation } from "react-i18next";
import { axiosClient } from "../api/axiosClient";

const { Title, Text } = Typography;

interface WarehouseStat {
  id?: string;
  warehouse_id?: string;
  warehouse_name?: string;
  name?: string;
  total_amount?: string;
  count?: number;
  [key: string]: any;
}

export default function WarehousePage() {
  const { t } = useTranslation();

  const { notification } = App.useApp();
  const { theme } = useUIStore();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState<boolean>(true);
  const [warehouses, setWarehouses] = useState<WarehouseStat[]>([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/stats/warehouses/');
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        setWarehouses(data);
      } catch (error) {
        notification.error({ message: 'Ошибка загрузки данных о складах' });
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  const columns = [
    {
      title: t('warehouses.name'),
      key: "name",
      render: (_: any, record: WarehouseStat) => (
        <Space>
          <DatabaseOutlined style={{ color: "#1890ff" }} /> 
          <strong style={{ color: isDark ? "rgba(255, 255, 255, 0.85)" : "#000000" }}>
            {record.warehouse_name || record.name || record.warehouse_id || 'N/A'}
          </strong>
        </Space>
      ),
    },
    {
      title: 'ID',
      key: 'warehouse_id',
      render: (_: any, record: WarehouseStat) => (
        <Text code style={{ fontSize: 11 }}>
          {(record.warehouse_id || record.id || '').toString().substring(0, 8)}…
        </Text>
      ),
    },
    {
      title: 'Общая сумма',
      key: 'total_amount',
      render: (_: any, record: WarehouseStat) => {
        const val = record.total_amount || record.count || '0';
        return <Tag color="blue">{val}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }} styles={{ body: { padding: "16px 24px" } }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
            <div>
              <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px", fontWeight: 600 }}>{t('warehouses.title')}</Title>
              <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block", color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)" }}>{t('warehouses.subtitle')}</Text>
            </div>
            <div style={{ width: 40, height: 40, flexShrink: 0 }}>
              <DotLottieReact src="https://lottie.host/embed/8410b0fb-7182-4160-b747-d5d14df21598/E9G9XfRsh2.json" autoplay loop />
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : warehouses.length === 0 ? (
        <Empty description={t('warehouses.noData')} />
      ) : (
        <Table 
          dataSource={warehouses} 
          columns={columns} 
          rowKey={(record, i) => record.id || record.warehouse_id || String(i)} 
          pagination={false} 
          scroll={{ x: 'max-content' }} 
        />
      )}
    </div>
  );
}