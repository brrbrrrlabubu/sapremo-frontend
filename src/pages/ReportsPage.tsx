import { Card, List, Button, Row, Col, Space, notification } from "antd";
import { FilePdfOutlined, FileExcelOutlined, DownloadOutlined, BarChartOutlined } from "@ant-design/icons";
import PageHeader from "../components/PageHeader";
import { useShipmentStore } from "../store/shipmentStore";
import { exportToExcel } from "../utils/exportUtils"; 
import { exportToPDF } from "../utils/pdfExport";

export default function ReportsPage() {
  const { shipments } = useShipmentStore();

  // Экспорт в Excel
  const handleExcelExport = () => {
    if (shipments.length === 0) {
      notification.warning({ message: "Нет данных для экспорта" });
      return;
    }
    exportToExcel(shipments, "Реестр_отгрузок_2026");
    notification.success({ message: "Excel файл сформирован!" });
  };

  // Экспорт в PDF (формируем таблицы)
  const handlePdfExport = async (type: 'finance' | 'warehouse' | 'quarter') => {
    if (shipments.length === 0) {
      notification.warning({ message: "Нет данных для отчета" });
      return;
    }

    let title = "";
    let columns: any[] = [];
    let data: any[] = [];

    if (type === 'finance') {
      title = "Финансовый отчет Июнь 2026";
      columns = [{ title: "Документ", dataIndex: "docNumber" }, { title: "Сумма (сом)", dataIndex: "amount" }];
      data = shipments.map(s => ({ docNumber: s.docNumber, amount: s.amount }));
    } else if (type === 'warehouse') {
      title = "Аналитика эффективности складов";
      columns = [{ title: "Склад", dataIndex: "warehouse" }, { title: "Сумма", dataIndex: "amount" }];
      data = shipments.map(s => ({ warehouse: s.warehouse, amount: s.amount }));
    } else {
      title = "Отчет за квартал";
      columns = [{ title: "Дата", dataIndex: "date" }, { title: "Сумма", dataIndex: "amount" }];
      data = shipments.map(s => ({ date: s.date, amount: s.amount }));
    }

    await exportToPDF(title, columns, data);
    notification.success({ message: "PDF файл сформирован!" });
  };

  const reportFiles = [
    { title: "Финансовый отчет за Июнь 2026", type: "PDF", icon: <FilePdfOutlined />, action: () => handlePdfExport('finance') },
    { title: "Реестр всех отгрузок (Общий)", type: "Excel", icon: <FileExcelOutlined />, action: handleExcelExport },
    { title: "Аналитика эффективности складов", type: "PDF", icon: <BarChartOutlined />, action: () => handlePdfExport('warehouse') },
  ];

  return (
    <div>
      <PageHeader title="📑 Отчеты" />
      <Row gutter={16}>
        <Col span={16}>
          <Card title="Доступные документы" variant="outlined" style={{ borderRadius: "4px" }}>
            <List
              itemLayout="horizontal"
              dataSource={reportFiles}
              renderItem={(item) => (
                <List.Item actions={[<Button type="link" icon={<DownloadOutlined />} onClick={item.action}>Скачать</Button>]}>
                  <List.Item.Meta avatar={item.icon} title={item.title} description={`Формат: ${item.type}`} />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Быстрый экспорт" variant="outlined" style={{ borderRadius: "4px" }}>
            <Space orientation="vertical" style={{ width: "100%" }}>
              <Button block icon={<FileExcelOutlined />} onClick={handleExcelExport}>Экспорт всей базы</Button>
              <Button block icon={<FilePdfOutlined />} onClick={() => handlePdfExport('quarter')}>PDF: Отчет за квартал</Button>
              <Button block type="primary" icon={<BarChartOutlined />} onClick={() => handlePdfExport('warehouse')}>PDF: Аналитика складов</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}