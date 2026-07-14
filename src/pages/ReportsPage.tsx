import { useEffect, useState } from "react";
import { Card, Typography, Table, Button, Row, Col, Space, App, Tag } from "antd";
import { FilePdfOutlined, FileExcelOutlined, BarChartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { InvoiceService } from "../services/invoice.service";
import type { Invoice } from "../types/api.types";
import { PALETTE } from "../theme/tokens";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function ReportsPage() {
  const { t } = useTranslation();
  const { notification } = App.useApp();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await InvoiceService.getInvoices();
      setInvoices(data.results);
    } catch (error) {
      notification.error({
        message: t('reports.errorFetch', 'Ошибка загрузки накладных'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string, format: 'pdf' | 'excel') => {
    setDownloadingId(`${id}-${format}`);
    try {
      await InvoiceService.downloadInvoice(id, format);
      notification.success({
        message: t('actions.download'),
        description: `invoice_${id.substring(0, 8)}.${format === 'pdf' ? 'pdf' : 'xlsx'}`,
        placement: "bottomRight",
      });
    } catch (error) {
      notification.error({
        message: t('reports.errorDownload', 'Ошибка при скачивании файла'),
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    {
      title: t('reports.id', 'ID'),
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text code style={{ fontSize: 11 }}>{id.substring(0, 8)}…</Text>,
    },
    {
      title: t('reports.warehouse', 'Склад'),
      dataIndex: 'warehouse_id',
      key: 'warehouse_id',
      render: (id: string) => <Text code style={{ fontSize: 11 }}>{id ? id.substring(0, 8) : 'N/A'}…</Text>,
    },
    {
      title: t('reports.amount', 'Сумма'),
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: string) => <Tag color="blue">{amount || '0'} сом</Tag>,
    },
    {
      title: t('reports.items', 'Позиции'),
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => items ? items.length : 0,
    },
    {
      title: t('reports.createdAt', 'Дата создания'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '—',
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: Invoice) => (
        <Space>
          <Button 
            type="link" 
            icon={<FilePdfOutlined />} 
            onClick={() => handleDownload(record.id, 'pdf')}
            loading={downloadingId === `${record.id}-pdf`}
          >
            PDF
          </Button>
          <Button 
            type="link" 
            icon={<FileExcelOutlined />} 
            onClick={() => handleDownload(record.id, 'excel')}
            loading={downloadingId === `${record.id}-excel`}
          >
            Excel
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }} styles={{ body: { padding: "20px 24px" } }}>
        <Title level={3} style={{ color: PALETTE.primary, margin: 0, fontSize: "20px" }}>{t('reports.title')}</Title>
        <Text type="secondary" style={{ fontSize: "14px", marginTop: 4, display: "block" }}>{t('reports.subtitle')}</Text>
      </Card>

      <Row gutter={16}>
        <Col xs={24} md={16}>
          <Card title={t('reports.invoices', 'Накладные')} bordered={true} style={{ borderRadius: "4px" }}>
            <Table 
              loading={loading}
              columns={columns} 
              dataSource={invoices} 
              rowKey="id" 
              pagination={{ pageSize: 20 }}
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: t('reports.noInvoices', 'Нет накладных.') }}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title={t('reports.quickExport')} bordered={true} style={{ borderRadius: "4px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button block icon={<FileExcelOutlined />}>{t('reports.exportAll')}</Button>
              <Button block icon={<FilePdfOutlined />}>{t('reports.printSummary')}</Button>
              <Button block type="primary" icon={<BarChartOutlined />}>{t('reports.pdfQuarter')}</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}