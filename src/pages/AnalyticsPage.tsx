import { Card, Row, Col, Statistic, Table } from "antd";
import { LineChartOutlined, TeamOutlined, FileTextOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { WAREHOUSES } from "../constants/warehouses";
import { useShipmentStore } from "../store/shipmentStore";

export default function AnalyticsPage() {
  const { shipments } = useShipmentStore();

  // 1. Расчет общей статистики
  const totalTurnover = shipments.reduce((sum, s) => sum + (s.amount || 0), 0);
  const activeShipmentsCount = shipments.filter(s => s.status === "transit").length;

  const stats = [
    { title: "Общий оборот", value: totalTurnover.toLocaleString(), suffix: "сом", icon: <LineChartOutlined /> },
    { title: "Активных складов", value: WAREHOUSES.length.toString(), icon: <TeamOutlined /> },
    { title: "Всего отгрузок", value: shipments.length.toString(), icon: <FileTextOutlined /> },
    { title: "Товаров в пути", value: activeShipmentsCount.toString(), icon: <ShoppingCartOutlined /> },
  ];

  // 2. Расчет данных для таблицы (группировка по складам)
  const dataSource = WAREHOUSES.map((w) => {
    const warehouseShipments = shipments.filter(s => s.warehouse === w.name);
    const turnover = warehouseShipments.reduce((sum, s) => sum + (s.amount || 0), 0);
    
    return {
      key: w.id,
      name: w.name,
      turnover: `${turnover.toLocaleString()} сом`,
      status: 'Активен'
    };
  });

  const columns = [
    { title: 'Название склада', dataIndex: 'name', key: 'name' },
    { title: 'Оборот', dataIndex: 'turnover', key: 'turnover' },
    { title: 'Статус', dataIndex: 'status', key: 'status' },
  ];

  return (
    <div>
      <PageHeader title="💷 Аналитика" />

      {/* Блок с показателями */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map((item, index) => (
          <Col span={6} key={index}>
            <Card hoverable style={{ textAlign: 'center', borderRadius: '4px' }}>
              <Statistic 
                title={item.title} 
                value={item.value} 
                suffix={item.suffix}
                prefix={item.icon} 
                valueStyle={{ fontSize: "22px", fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Нижняя таблица */}
      <Card title="Детальный отчет по складам" bordered={true} style={{ borderRadius: "4px" }}>
        <Table dataSource={dataSource} columns={columns} pagination={false} />
      </Card>
    </div>
  );
}