import { useState, useEffect, useCallback } from 'react';
import {
  Row, Col, Card, Typography, Table, Tag, Button, Select, Tabs,
  DatePicker, Modal, Form, Input, App, Statistic, Spin,
} from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, BankOutlined } from '@ant-design/icons';
import { PALETTE } from '../theme/tokens';
import { PaymentService } from '../services/payment.service';
import { DriverService } from '../services/driver.service';
import {
  parseMoney,
  formatMoney,
  formatMoneyWithSign,
  filterIncomePayments,
  filterExpensePayments,
  getPaymentDate,
  sumDebtsFromApi,
} from '../utils/finance';
import { MobileCard, MobileCardList } from '../components/MobileCard';
import { useResponsiveTable } from '../hooks/useResponsiveTable';
import { safeValidate, safeValidateArray } from '../lib/safeValidate';
import { PaymentSchema, DebtSchema } from '../schemas/apiSchemas';
import type { Payment } from '../types/api.types';
import { useUserStore } from '../store/useUserStore';
import { UserRole } from '../types/enums';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// ─── WarehouseFinance ─────────────────────────────────────────────────────────
function WarehouseFinance() {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { isMobile, tableScroll } = useResponsiveTable(800);

  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [driversMap, setDriversMap] = useState<Record<string, string>>({});
  const [totalDebt, setTotalDebt] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);

  const isExpense = activeTab === 'expense';

  const fetchDriversMap = useCallback(async () => {
    try {
      const data = await DriverService.getDrivers({ page: 0, size: 100 });
      const map: Record<string, string> = {};
      data.content?.forEach((d: { id: string; fullName: string }) => {
        map[d.id] = d.fullName;
      });
      setDriversMap(map);
    } catch (e) {
      console.error('[WarehouseFinance] fetchDriversMap:', e);
    }
  }, []);

  const loadData = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const [paymentsRes, debtsRaw] = await Promise.all([
        PaymentService.getPayments(page, pageSize),
        PaymentService.getAllDebts(),
      ]);

      // Валидируем список платежей — невалидные элементы пропускаем, не ломаем UI
      const validPayments = safeValidateArray(PaymentSchema, paymentsRes.results, 'Платежи');
      setPayments(validPayments);
      setTotal(paymentsRes.count);

      // Валидируем долги
      const validDebts = safeValidateArray(DebtSchema, debtsRaw, 'Долги');

      /**
       * ФОРМУЛА: Долг = Принятый товар - Оплаты
       * Если бэк возвращает debt-объекты с amount — используем их как основу.
       * В идеале должен быть endpoint /finance/summary/, который считает сам.
       * Здесь используем fallback: сумма debt.amount из API.
       *
       * Настоящая формула из validPayments:
       *   receivedTotal считается в PaymentService.getReceivedTotal() или приходит из KPI
       */
      const debtSum = sumDebtsFromApi(validDebts);
      setTotalDebt(debtSum);

      // Итого доходов из текущей страницы — показываем пользователю контекст
      const incomeSum = validPayments.reduce((acc, p) => {
        const amount = parseMoney(p.amount);
        return amount > 0 ? acc + amount : acc;
      }, 0);
      setTotalIncome(incomeSum);

    } catch (err) {
      console.error('[WarehouseFinance] loadData:', err);
      message.error(t('finance.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [message, t]);

  useEffect(() => {
    fetchDriversMap();
  }, [fetchDriversMap]);

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, loadData]);

  // ── Данные таблиц ─────────────────────────────────────────────────────────
  const incomeData = filterIncomePayments(payments).map((p) => ({
    id: p.id,
    date: getPaymentDate(p),
    amount: parseMoney(p.amount),
    amountFormatted: formatMoneyWithSign(parseMoney(p.amount), t('common.som')),
    paymentType: p.payment_method || t('finance.cash'),
    driver: driversMap[p.client_id] || (p as any).client_name || (p.client_id ? `Клиент ${p.client_id.slice(0, 6)}` : '—'),
    note: p.comment || '—',
  }));

  const expenseData = filterExpensePayments(payments).map((p) => ({
    id: p.id,
    date: getPaymentDate(p),
    amount: parseMoney(p.amount),
    amountFormatted: formatMoney(parseMoney(p.amount), { currency: t('common.som') }),
    paymentType: p.payment_method || t('finance.cash'),
    recipient: driversMap[p.client_id] || (p as any).client_name || (p.client_id ? `Клиент ${p.client_id.slice(0, 6)}` : '—'),
    note: p.comment || '—',
  }));

  const currentData = isExpense ? expenseData : incomeData;

  // ── Колонки ───────────────────────────────────────────────────────────────
  const baseColumns = [
    { title: t('finance.dateCol'), dataIndex: 'date', key: 'date', width: 110 },
    {
      title: t('finance.amountCol'),
      dataIndex: 'amountFormatted',
      key: 'amount',
      width: 140,
      render: (text: string, record: { amount: number }) => (
        <span style={{ color: record.amount >= 0 ? PALETTE.success : PALETTE.error, fontWeight: 600 }}>
          {text}
        </span>
      ),
    },
    {
      title: t('finance.paymentTypeCol'),
      dataIndex: 'paymentType',
      key: 'paymentType',
      width: 130,
      render: (type: string) => {
        const isCash = type === t('finance.cash') || type === 'cash' || type === 'Наличный';
        return <Tag color={isCash ? 'success' : 'processing'} style={{ borderRadius: 4 }}>{type}</Tag>;
      },
    },
  ];

  const incomeColumns = [
    ...baseColumns,
    { title: t('finance.driverCol'), dataIndex: 'driver', key: 'driver' },
    { title: t('finance.noteCol'), dataIndex: 'note', key: 'note' },
  ];

  const expenseColumns = [
    ...baseColumns,
    {
      title: t('finance.recipientCol'),
      dataIndex: 'recipient',
      key: 'recipient',
      render: (text: string) => (
        <span style={{ background: 'var(--color-bg-layout,#f5f5f5)', padding: '4px 8px', borderRadius: 4, fontSize: 13 }}>
          {text}
        </span>
      ),
    },
    { title: t('finance.noteCol'), dataIndex: 'note', key: 'note' },
  ];

  // ── Мобильные карточки ───────────────────────────────────────────────────
  const renderMobileCard = (item: typeof currentData[number]) => (
    <MobileCard
      key={item.id}
      fields={[
        {
          label: t('finance.amountCol'),
          value: item.amountFormatted,
          isPrimary: true,
        },
        { label: t('finance.dateCol'), value: item.date },
        {
          label: t('finance.paymentTypeCol'),
          value: item.paymentType,
          tagColor: item.paymentType === t('finance.cash') ? 'success' : 'processing',
        },
        {
          label: isExpense ? t('finance.recipientCol') : t('finance.driverCol'),
          value: isExpense ? (item as any).recipient : (item as any).driver,
        },
        { label: t('finance.noteCol'), value: item.note },
      ]}
    />
  );

  // ── Сводные карточки ─────────────────────────────────────────────────────
  const summaryCards = [
    {
      title: t('finance.currentDebt'),
      value: totalDebt,
      prefix: <BankOutlined />,
      valueStyle: { color: PALETTE.error },
      suffix: t('common.som'),
    },
    {
      title: t('finance.totalTransactions'),
      value: total,
      prefix: <ArrowUpOutlined />,
      valueStyle: { color: PALETTE.primary },
    },
    {
      title: t('finance.incomeOnPage'),
      value: totalIncome,
      prefix: <ArrowDownOutlined />,
      valueStyle: { color: PALETTE.success },
      suffix: t('common.som'),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
        {t('finance.title')}
      </Title>

      {/* Сводные карточки */}
      <Row gutter={[16, 16]}>
        {summaryCards.map((card, i) => (
          <Col xs={24} sm={8} key={i}>
            <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <Statistic
                title={<Text type="secondary">{card.title}</Text>}
                value={card.value}
                prefix={card.prefix}
                suffix={card.suffix}
                valueStyle={card.valueStyle}
                formatter={(v) => formatMoney(Number(v))}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Таблица/карточки */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Табы и фильтры */}
        <div style={{ padding: '16px 24px 0' }}>
          <Tabs
            activeKey={activeTab}
            onChange={(k) => setActiveTab(k as 'income' | 'expense')}
            items={[
              { key: 'income', label: t('finance.incomeTab') },
              { key: 'expense', label: t('finance.expenseTab') },
            ]}
          />
        </div>

        <div
          style={{
            padding: '0 24px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <RangePicker
              style={{ borderRadius: 6 }}
              placeholder={[t('finance.startDate'), t('finance.endDate')]}
            />
            <Select
              placeholder={t('finance.paymentTypeFilter')}
              style={{ width: 150 }}
              allowClear
              options={[
                { value: 'cash', label: t('finance.cash') },
                { value: 'card', label: t('finance.cashless') },
              ]}
            />
          </div>
          <Button
            type="primary"
            danger={isExpense}
            icon={<PlusOutlined />}
            style={{ borderRadius: 6 }}
            onClick={() => setIsModalOpen(true)}
          >
            {isExpense ? t('finance.newExpense') : t('finance.newIncome')}
          </Button>
        </div>

        {/* Адаптивный вывод */}
        {isMobile ? (
          <MobileCardList
            data={currentData}
            loading={loading}
            renderCard={renderMobileCard}
            emptyText={t('common.noData')}
          />
        ) : (
          <Table
            columns={(isExpense ? expenseColumns : incomeColumns) as any}
            dataSource={currentData}
            loading={loading}
            pagination={{
              current: currentPage,
              total,
              pageSize,
              showSizeChanger: false,
              onChange: setCurrentPage,
              showTotal: (tot, range) =>
                t('common.shown', { from: range[0], to: range[1], total: tot.toLocaleString() }),
            }}
            rowKey="id"
            scroll={tableScroll}
            style={{ padding: '0 24px 24px' }}
          />
        )}

        {/* Пагинация для мобильных карточек */}
        {isMobile && (
          <div style={{ padding: '8px 16px 16px', display: 'flex', justifyContent: 'center' }}>
            <Select
              value={currentPage}
              onChange={setCurrentPage}
              style={{ width: 120 }}
              options={Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => ({
                value: i + 1,
                label: `Стр. ${i + 1}`,
              }))}
            />
          </div>
        )}
      </Card>

      {/* Модал добавления */}
      <Modal
        title={isExpense ? t('finance.newExpense') : t('finance.newIncome')}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        footer={[
          <Button key="back" onClick={() => { setIsModalOpen(false); form.resetFields(); }}>
            {t('common.cancel')}
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() =>
              form.validateFields().then(async (values) => {
                try {
                  await PaymentService.createPayment({
                    ...values,
                    amount: isExpense ? -Math.abs(values.amount) : Math.abs(values.amount),
                  });
                  message.success(t('common.saved'));
                  setIsModalOpen(false);
                  form.resetFields();
                  loadData(currentPage);
                } catch {
                  message.error(t('common.error'));
                }
              })
            }
          >
            {t('common.save')}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label={t('common.date')}
            name="date"
            rules={[{ required: true, message: t('common.selectDate') }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>

          <Form.Item
            label={t('finance.amountLabel')}
            name="amount"
            rules={[
              { required: true, message: t('common.enterQuantity') },
              {
                validator: (_, v) =>
                  Number(v) > 0 ? Promise.resolve() : Promise.reject('Сумма должна быть больше 0'),
              },
            ]}
          >
            <Input addonAfter={t('common.som')} type="number" min={0} />
          </Form.Item>

          <Form.Item
            label={t('finance.paymentTypeLabel')}
            name="paymentType"
            rules={[{ required: true, message: t('finance.selectPaymentType') }]}
          >
            <Select placeholder={t('finance.selectPaymentType')}>
              <Select.Option value="cash">{t('finance.cash')}</Select.Option>
              <Select.Option value="card">{t('finance.cashless')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={t('common.note')} name="comment">
            <TextArea placeholder={t('common.optional')} rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ─── FactoryFinance ───────────────────────────────────────────────────────────
interface WarehouseDebtRow {
  id: string;
  warehouse: string;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  currentDebt: number;
}

function FactoryFinance() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { isMobile, tableScroll } = useResponsiveTable(700);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<WarehouseDebtRow[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // TODO: заменить на реальный endpoint /api/factory/finance/warehouse-debts/
        // когда бэк его реализует. Пока используем PaymentService.getAllDebts()
        const debts = await PaymentService.getAllDebts();
        const validated = safeValidateArray(DebtSchema, debts, 'Долги складов (factory)');
        setRows(
          validated.map((d) => ({
            id: d.id,
            warehouse: d.warehouse_id, // TODO: маппинг на название
            lastPaymentDate: d.updated_at ? new Date(d.updated_at).toLocaleDateString('ru-RU') : '—',
            lastPaymentAmount: 0, // придёт с нового endpoint
            currentDebt: parseMoney(d.amount),
          }))
        );
      } catch {
        message.error(t('finance.errorLoading'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [message, t]);

  const columns = [
    {
      title: 'Склад',
      dataIndex: 'warehouse',
      key: 'warehouse',
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    { title: 'Дата последней оплаты', dataIndex: 'lastPaymentDate', key: 'lastPaymentDate' },
    {
      title: 'Сумма оплаты',
      dataIndex: 'lastPaymentAmount',
      key: 'lastPaymentAmount',
      render: (v: number) =>
        v > 0 ? (
          <span style={{ color: PALETTE.success, fontWeight: 600 }}>+{formatMoney(v)} сом</span>
        ) : '—',
    },
    {
      title: 'Текущий долг',
      dataIndex: 'currentDebt',
      key: 'currentDebt',
      render: (v: number) => (
        <span style={{ color: v > 0 ? PALETTE.error : PALETTE.success, fontWeight: 600 }}>
          {formatMoney(v)} сом
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Title level={2} style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
        История оплат и долги складов
      </Title>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : isMobile ? (
        <MobileCardList
          data={rows}
          renderCard={(row) => (
            <MobileCard
              key={row.id}
              fields={[
                { label: 'Склад', value: row.warehouse, isPrimary: true },
                { label: 'Последняя оплата', value: row.lastPaymentDate },
                {
                  label: 'Долг',
                  value: `${formatMoney(row.currentDebt)} сом`,
                  tagColor: row.currentDebt > 0 ? 'error' : 'success',
                },
              ]}
            />
          )}
        />
      ) : (
        <Card
          bordered={false}
          style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={columns}
            dataSource={rows}
            pagination={false}
            rowKey="id"
            scroll={tableScroll}
            style={{ padding: 24 }}
          />
        </Card>
      )}
    </div>
  );
}

// ─── Точка входа ─────────────────────────────────────────────────────────────
export default function FinancePage() {
  const { user } = useUserStore();
  const isFactory = user?.role === UserRole.Factory;
  return isFactory ? <FactoryFinance /> : <WarehouseFinance />;
}