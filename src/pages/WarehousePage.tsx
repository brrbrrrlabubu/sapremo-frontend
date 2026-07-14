import { useState, useEffect } from "react";
import { Table, Skeleton, Empty, Space, Tag, Typography, Card, App } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useUIStore } from "../store/useUIStore";
import { useTranslation } from "react-i18next";
import { WarehouseService, type WarehouseStat } from "../services/warehouse.service";
import { PALETTE, themed } from "../theme/tokens";

const { Title, Text } = Typography;



export default function WarehousePage() {
  const { t } = useTranslation();

  const { notification } = App.useApp();
  const { theme } = useUIStore();
  const isDark = theme === "dark";
  const tTheme = themed(isDark);

  const [loading, setLoading] = useState<boolean>(true);
  const [warehouses, setWarehouses] = useState<WarehouseStat[]>([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        const data = await WarehouseService.getStats();
        setWarehouses(data);
      } catch (error) {
        notification.error({ message: t('warehouses.errorLoading', 'Ошибка загрузки данных о складах') });
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
          <DatabaseOutlined style={{ color: PALETTE.primary }} /> 
          <strong style={{ color: tTheme.text }}>
            {record.warehouse_name || record.name || record.warehouse_id || 'N/A'}
          </strong>
        </Space>
      ),
    },
    {
      title: t('warehouses.id', 'ID'),
      key: 'warehouse_id',
      render: (_: any, record: WarehouseStat) => (
        <Text code style={{ fontSize: 11 }}>
          {(record.warehouse_id || record.id || '').toString().substring(0, 8)}…
        </Text>
      ),
    },
    {
      title: t('warehouses.totalAmount', 'Общая сумма'),
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
              <Title level={3} style={{ color: PALETTE.primary, margin: 0, fontSize: "20px", fontWeight: 600 }}>{t('warehouses.title')}</Title>
              <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block", color: tTheme.textTertiary }}>{t('warehouses.subtitle')}</Text>
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
          rowKey={(record, i) => record.id || record.warehouse_id || record.name || String(i)} 
          pagination={false} 
          scroll={{ x: 'max-content' }} 
        />
      )}
    </div>
  );
}