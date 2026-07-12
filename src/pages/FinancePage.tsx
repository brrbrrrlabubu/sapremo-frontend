import { useEffect, useState } from "react";
import { Table, Card, Typography, Row, Col, Statistic, Tabs, Tag, Button, Spin, Alert } from "antd";
import { RiseOutlined, FallOutlined, BankOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useUIStore } from "../store/useUIStore";
import { useTranslation } from "react-i18next";
import { PaymentService } from "../services/payment.service";
import { InvoiceService } from "../services/invoice.service";
import { useApiOperation } from "../hooks/useRequestOperations";
import { DebtSchema } from "../schemas/apiSchemas";
import { z } from "zod";

const { Title, Text } = Typography;

type Debt = z.infer<typeof DebtSchema>;

export default function FinancePage() {
  const { t } = useTranslation();
  const { theme } = useUIStore();
  const isDark = theme === "dark";

  const { isLoading, error, execute } = useApiOperation();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // ─── Загрузка дебиторской задолженности с реального API ──────────────────
  useEffect(() => {
    const fetchDebts = async () => {
      try {
        const data = await execute(
          () => PaymentService.getAllDebts(),
          { endpoint: '/payments/debts/all/', method: 'GET', payload: {} },
          { offlineFallback: false }
        );
        if (data) setDebts(data);
      } catch {
        // Ошибка уже установлена внутри useApiOperation
      }
    };
    fetchDebts();
  }, []);

  // ─── Скачивание накладной по ID склада-должника ───────────────────────────
  const handleDownload = async (warehouseId: string, format: 'pdf' | 'excel') => {
    setDownloadingId(`${warehouseId}-${format}`);
    try {
      await InvoiceService.downloadInvoice(warehouseId, format);
    } catch {
      // InvoiceService сам создаёт blob и инициирует скачивание — ошибка логируется в консоль
    } finally {
      setDownloadingId(null);
    }
  };

  // ─── Агрегированные итоги по всем долгам ─────────────────────────────────
  const totalDebt = debts.reduce((sum, d) => sum + parseFloat(d.total_debt || '0'), 0);

  const stats = {
    debtCount: debts.length,
    totalDebt: totalDebt.toLocaleString('ru-RU', { maximumFractionDigits: 2 }),
  };

  // ─── Колонки таблицы долгов ───────────────────────────────────────────────
  const debtColumns = [
    {
      title: 'ID Склада',
      dataIndex: 'warehouse_id',
      key: 'warehouse_id',
      render: (id: string) => <Text code style={{ fontSize: 11 }}>{id.substring(0, 8)}…</Text>,
    },
    {
      title: 'Наименование филиала',
      dataIndex: 'warehouse_name',
      key: 'warehouse_name',
    },
    {
      title: 'Задолженность (Рва)',
      dataIndex: 'total_debt',
      key: 'total_debt',
      render: (val: string) => (
        <Tag color="volcano" style={{ fontWeight: 'bold', fontSize: 13 }}>
          {parseFloat(val).toLocaleString('ru-RU')} сом
        </Tag>
      ),
    },
    {
      title: 'Экспорт документов',
      key: 'actions',
      render: (_: unknown, record: Debt) => (
        <span>
          <Button
            type="link"
            icon={<FilePdfOutlined />}
            size="small"
            loading={downloadingId === `${record.warehouse_id}-pdf`}
            onClick={() => handleDownload(record.warehouse_id, 'pdf')}
            style={{ marginRight: 4 }}
          >
            PDF
          </Button>
          <Button
            type="link"
            icon={<FileExcelOutlined />}
            size="small"
            loading={downloadingId === `${record.warehouse_id}-excel`}
            onClick={() => handleDownload(record.warehouse_id, 'excel')}
          >
            Excel
          </Button>
        </span>
      ),
    },
  ];

  // ─── Колонки вкладки платежей (статические примеры до появления эндпоинта) ─
  const paymentColumns = [
    { title: t('finance.source'), dataIndex: "source", key: "source" },
    {
      title: t('finance.amountSom'),
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: t('dashboard.status'),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === t('status.paid') ? "green" : "volcano"}>{status}</Tag>
      ),
    },
  ];

  const paymentData = [
    { key: "1", source: "Заказ №123", amount: 150000, status: t('status.paid') },
    { key: "2", source: "Заказ №124", amount: 95000, status: t('status.waiting') },
  ];

  return (
    <div>
      <Card bordered={true} style={{ marginBottom: 24, borderRadius: "4px" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ color: '#1890ff', margin: 0, fontSize: "20px", fontWeight: 600 }}>
            {t('finance.title')}
          </Title>
          <Text type="secondary" style={{ color: isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(0, 0, 0, 0.45)" }}>
            {t('finance.subtitle')}
          </Text>
        </div>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card size="small" bordered={false} style={{ background: isDark ? "#142518" : "#f6ffed", border: isDark ? "1px solid #1b3d22" : "none" }}>
              <Statistic
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>{t('finance.totalRevenue')}</span>}
                value={0}
                prefix={<RiseOutlined />}
                suffix={t('shipments.som')}
                valueStyle={{ color: isDark ? "#52c41a" : "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" bordered={false} style={{ background: isDark ? "#2c1517" : "#fff2f0", border: isDark ? "1px solid #4a1e22" : "none" }}>
              <Statistic
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>{t('finance.debt')}</span>}
                value={stats.totalDebt}
                prefix={<FallOutlined />}
                suffix={t('shipments.som')}
                valueStyle={{ color: isDark ? "#ff4d4f" : "#cf1322" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small" bordered={false} style={{ background: isDark ? "#111a2c" : "#f0f9ff", border: isDark ? "1px solid #152542" : "none" }}>
              <Statistic
                title={<span style={{ color: isDark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.45)" }}>{t('finance.activeShipments')}</span>}
                value={stats.debtCount}
                prefix={<BankOutlined />}
                valueStyle={{ color: isDark ? "#1890ff" : "inherit" }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Отображение сетевой ошибки */}
      {error && (
        <Alert
          type="error"
          message="Ошибка загрузки данных"
          description={error}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Tabs items={[
        {
          key: "1",
          label: "Дебиторская задолженность",
          children: isLoading && debts.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" tip="Получение актуального баланса контрагентов..." />
              </div>
            )
            : (
              <Table
                dataSource={debts}
                columns={debtColumns}
                rowKey="warehouse_id"
                pagination={{ pageSize: 20 }}
                scroll={{ x: 'max-content' }}
                locale={{ emptyText: 'Дебиторская задолженность по складам отсутствует.' }}
              />
            ),
        },
        {
          key: "2",
          label: t('finance.cashFlow'),
          children: (
            <Table
              dataSource={paymentData}
              columns={paymentColumns}
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          ),
        },
        {
          key: "3",
          label: t('finance.report'),
          children: (
            <div style={{ padding: 20, color: isDark ? "rgba(255, 255, 255, 0.85)" : "inherit" }}>
              {t('finance.reportPlaceholder')}
            </div>
          ),
        },
      ]} />
    </div>
  );
}