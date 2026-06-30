import { Card, Row, Col, Typography, Statistic, Table } from "antd";
import { LineChartOutlined, TeamOutlined, FileTextOutlined, ShoppingCartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AnalyticsPage() {
  const dataSource = [
    { key: '1', name: 'Главный склад', turnover: '850,000 сом', status: 'Активен' },
    { key: '2', name: 'Транзитный склад', turnover: '420,000 сом', status: 'Активен' },
  ];

  const columns = [
    { title: 'Название склада', dataIndex: 'name', key: 'name' },
    { title: 'Оборот', dataIndex: 'turnover', key: 'turnover' },
    { title: 'Статус', dataIndex: 'status', key: 'status' },
  ];

  return (
    <div>
      {/* Прямоугольник-шапка, как на Главной */}
      <Card 
        bordered={true} 
        style={{ marginBottom: 24, borderRadius: "4px", border: "1px solid #e8e8e8" }} 
        styles={{ body: { padding: "20px 24px" } }}
      >
        <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px" }}>
          Аналитика и отчетность
        </Title>
        <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block" }}>
          Мониторинг ключевых показателей эффективности логистической системы завода.
        </Text>
      </Card>

      {/* Блок с показателями */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[
          { title: "Средний оборот", value: "513,000", suffix: "сом", icon: <LineChartOutlined /> },
          { title: "Активных точек", value: "3", icon: <TeamOutlined /> },
          { title: "Обработано заявок", value: "142", icon: <FileTextOutlined /> },
          { title: "Товаров в пути", value: "28", icon: <ShoppingCartOutlined /> },
        ].map((item, index) => (
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