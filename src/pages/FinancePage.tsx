import { useMemo } from "react";
import { Table, Card, Typography, Row, Col, Statistic, Tabs, Tag } from "antd";
import { RiseOutlined, FallOutlined, BankOutlined } from "@ant-design/icons";
import { useUIStore } from "../store/useUIStore";

const { Title, Text } = Typography;

// ==========================================
// 1. СТАТИЧНЫЕ ДАННЫЕ И КОНФИГУРАЦИИ
// ==========================================
const STATS_MOCK = {
  totalRevenue: 1540000,
  debtAmount: 245000,
  activeShipments: 12,
};

const TRANSACTION_DATA = [
  { key: "1", source: "Заказ №123", amount: 150000, status: "Оплачено" },
  { key: "2", source: "Заказ №124", amount: 95000, status: "В ожидании" },
];

const WAREHOUSE_DATA = [
  { key: "1", name: "Главный склад Завод", type: "Производственный", address: "г. Бишкек, ул. Промышленная 5", turnover: 45000, status: "Активен" },
  { key: "2", name: "Транзитный склад Чуй", type: "Транзитный", address: "Чуйская обл., с. Лебединовка", turnover: 12000, status: "Активен" },
  { key: "3", name: "Розничная точка Вефа", type: "Розничный", address: "г. Бишкек, ТЦ Вефа", turnover: 0, status: "Заблокирован" },
];

// ==========================================
// 2. ФУНКЦИОНАЛЬНЫЙ КОМПОНЕНТ
// ==========================================
export default function FinancePage() {
  const { theme } = useUIStore();
  const isDark = theme === "dark";

  // Колонки "Движение средств" с чистыми семантическими статусами
  const transactionColumns = useMemo(() => [
    { 
      title: "Источник", 
      dataIndex: "source", 
      key: "source" 
    },
    { 
      title: "Сумма (сом)", 
      dataIndex: "amount", 
      key: "amount", 
      render: (val: number) => val.toLocaleString() 
    },
    { 
      title: "Статус", 
      dataIndex: "status", 
      key: "status", 
      render: (status: string) => {
        // Antd сам идеально подстроит яркость success и warning под темную и светлую тему
        const color = status === "Оплачено" ? "success" : "warning";
        return <Tag color={color}>{status}</Tag>;
      } 
    },
  ], []); // Зависимость [isDark] больше не нужна, так как Antd управляет цветом пресетов сам!

  // Колонки "Отчет по складам" с чистыми семантическими статусами
  const warehouseColumns = useMemo(() => [
    { title: "Название склада", dataIndex: "name", key: "name" },
    { title: "Тип", dataIndex: "type", key: "type" },
    { title: "Адрес", dataIndex: "address", key: "address" },
    { 
      title: "Оборот (сом)", 
      dataIndex: "turnover", 
      key: "turnover", 
      render: (val: number) => val.toLocaleString() 
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        // Идеальное семантическое разделение без кастомной каши
        const color = status === "Активен" ? "success" : "error";
        return <Tag color={color}>{status}</Tag>;
      }
    }
  ], []);

  return (
    <div>
      {/* Главная аналитическая карточка */}
      <Card 
        bordered={true} 
        style={{ 
          marginBottom: 24, 
          borderRadius: "4px",
          border: `1px solid ${isDark ? "#303030" : "#e8e8e8"}`,
          background: isDark ? "#1f1f1f" : "#ffffff"
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px", fontWeight: 600 }}>
            Финансовая аналитика
          </Title>
          <Text type="secondary" style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)" }}>
            Оперативная сводка по доходам, задолженностям и движению денежных средств.
          </Text>
        </div>

        {/* Сетка мини-карточек (Красивая структурированная верстка без сжатия в строку) */}
        <Row gutter={16}>
          {/* Карточка: Общая выручка */}
          <Col span={8}>
            <Card 
              size="small" 
              bordered={false} 
              style={{ 
                background: isDark ? "#142518" : "#f6ffed",
                border: isDark ? "1px solid #1b3d22" : "none"
              }}
            >
              <Statistic 
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>Общая выручка</span>} 
                value={STATS_MOCK.totalRevenue} 
                prefix={<RiseOutlined />} 
                suffix="сом" 
                valueStyle={{ color: isDark ? "#52c41a" : "#3f8600" }} 
              />
            </Card>
          </Col>

          {/* Карточка: Задолженность */}
          <Col span={8}>
            <Card 
              size="small" 
              bordered={false} 
              style={{ 
                background: isDark ? "#2c1517" : "#fff2f0",
                border: isDark ? "1px solid #4a1e22" : "none"
              }}
            >
              <Statistic 
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>Задолженность складов</span>} 
                value={STATS_MOCK.debtAmount} 
                prefix={<FallOutlined />} 
                suffix="сом" 
                valueStyle={{ color: isDark ? "#ff4d4f" : "#cf1322" }} 
              />
            </Card>
          </Col>

          {/* Карточка: Активные отгрузки */}
          <Col span={8}>
            <Card 
              size="small" 
              bordered={false} 
              style={{ 
                background: isDark ? "#111a2c" : "#f0f9ff",
                border: isDark ? "1px solid #152542" : "none"
              }}
            >
              <Statistic 
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>Активных отгрузок</span>} 
                value={STATS_MOCK.activeShipments} 
                prefix={<BankOutlined />} 
                valueStyle={{ color: isDark ? "#1890ff" : "inherit" }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Табы с таблицами */}
      <Tabs 
        items={[
          { 
            key: "1", 
            label: "Движение средств", 
            children: <Table dataSource={TRANSACTION_DATA} columns={transactionColumns} pagination={false} /> 
          },
          { 
            key: "2", 
            label: "Отчет по складам", 
            children: <Table dataSource={WAREHOUSE_DATA} columns={warehouseColumns} pagination={false} /> 
          },
        ]} 
      />
    </div>
  );
}