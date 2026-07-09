import { Card, List, Button, Row, Col, Space, notification } from "antd";
import { FilePdfOutlined, FileExcelOutlined, DownloadOutlined, BarChartOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";


export default function ReportsPage() {
  // Функция-заглушка для имитации скачивания
  const handleDownload = (fileName: string) => {
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
      <PageHeader title="📑 Отчеты" />

      {/* Список отчетов */}
      <Row gutter={16}>
        <Col span={16}>
          <Card title="Доступные документы" bordered={true} style={{ borderRadius: "4px" }}>
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

        {/* Блок быстрых действий */}
        <Col span={8}>
          <Card title="Быстрый экспорт" bordered={true} style={{ borderRadius: "4px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button block icon={<FileExcelOutlined />} onClick={() => handleDownload("Вся база данных")}>Экспорт всей базы</Button>
              <Button block icon={<FilePdfOutlined />} onClick={() => handleDownload("Сводка")}>Печать текущей сводки</Button>
              <Button block type="primary" icon={<BarChartOutlined />} onClick={() => handleDownload("Отчет за квартал")}>Сформировать PDF за квартал</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}