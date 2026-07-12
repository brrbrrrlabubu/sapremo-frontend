import { Card, Typography, List, Button, Row, Col, Space, App } from "antd";
import { FilePdfOutlined, FileExcelOutlined, DownloadOutlined, BarChartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

export default function ReportsPage() {
  const { t } = useTranslation();
  const { notification } = App.useApp();

  const handleDownload = (fileName: string) => {
    notification.success({
      message: t('actions.download'),
      description: `${fileName}`,
      placement: "bottomRight",
    });
  };

  const reportFiles = [
    { title: t('reports.report1'), type: "PDF", icon: <FilePdfOutlined /> },
    { title: t('reports.report2'), type: "Excel", icon: <FileExcelOutlined /> },
    { title: t('reports.report3'), type: "PDF", icon: <BarChartOutlined /> },
  ];

  return (
    <div>
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }} styles={{ body: { padding: "20px 24px" } }}>
        <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px" }}>{t('reports.title')}</Title>
        <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block" }}>{t('reports.subtitle')}</Text>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Card title={t('reports.available')} bordered={true} style={{ borderRadius: "4px" }}>
            <List
              itemLayout="horizontal"
              dataSource={reportFiles}
              renderItem={(item) => (
                <List.Item actions={[ <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownload(item.title)}>{t('actions.download')}</Button> ]}>
                  <List.Item.Meta avatar={item.icon} title={item.title} description={`${t('reports.format')} ${item.type}`} />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title={t('reports.quickExport')} bordered={true} style={{ borderRadius: "4px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button block icon={<FileExcelOutlined />} onClick={() => handleDownload(t('reports.exportAll'))}>{t('reports.exportAll')}</Button>
              <Button block icon={<FilePdfOutlined />} onClick={() => handleDownload(t('reports.printSummary'))}>{t('reports.printSummary')}</Button>
              <Button block type="primary" icon={<BarChartOutlined />} onClick={() => handleDownload(t('reports.pdfQuarter'))}>{t('reports.pdfQuarter')}</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}