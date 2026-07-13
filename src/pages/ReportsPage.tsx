import { Card, Typography, List, Button, Row, Col, Space, App } from "antd"; // <-- Импортируем App вместо notification
import { FilePdfOutlined, FileExcelOutlined, DownloadOutlined, BarChartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function ReportsPage() {
  // Достаем контекстный notification
  const { notification } = App.useApp();

  const handleDownload = (fileName: string) => {
    // Вызов остается прежним, но теперь плашка будет элегантного темного цвета!
    notification.success({
      message: "Загрузка началась",
      description: `Файл "${fileName}" готовится к скачиванию...`,
      placement: "bottomRight",
    });
  };

  const reportFiles = [
    { title: "Финансовый отчет за Июнь 2026", type: "PDF", icon: <FilePdfOutlined /> },
    { title: "Реестр всех отгрузок (Общий)", type: "Excel", icon: <FileExcelOutlined /> },
    { title: "Аналитика эффективности складов", type: "PDF", icon: <BarChartOutlined /> },
  ];

  return (
    <div>
      {/* Шапка */}
      <Card 
        bordered={true} 
        style={{ marginBottom: 24, borderRadius: "4px", border: "1px solid #e8e8e8" }} 
        styles={{ body: { padding: "20px 24px" } }}
      >
        <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px" }}>
          Отчеты
        </Title>
        <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block" }}>
          Формирование и экспорт аналитических данных для руководства завода.
        </Text>
      </Card>

      {/* Список отчетов */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={14} lg={16}>
          <Card title="Доступные документы" bordered={true} style={{ borderRadius: "4px", height: "100%" }}>
            <List
              itemLayout="horizontal"
              dataSource={reportFiles}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownload(item.title)}>Скачать</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.title}
                    description={`Формат: ${item.type}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Быстрый экспорт */}
        <Col xs={24} md={10} lg={8}>
          <Card title="Быстрый экспорт" bordered={true} style={{ borderRadius: "4px", height: "100%" }}>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Button 
                block 
                icon={<FileExcelOutlined />} 
                style={{ height: "36px" }}
                onClick={() => handleDownload("Вся база данных")}
              >
                Экспорт всей базы
              </Button>
              
              <Button 
                block 
                icon={<FilePdfOutlined />} 
                style={{ height: "36px" }}
                onClick={() => handleDownload("Сводка")}
              >
                Печать текущей сводки
              </Button>
              
              <Button 
                block 
                type="primary" 
                icon={<BarChartOutlined />} 
                style={{ 
                  height: "36px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center" 
                }} 
                onClick={() => handleDownload("Отчет за квартал")}
              >
                PDF за квартал
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}