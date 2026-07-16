import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Table, Tag, Button, Select, Tabs, DatePicker, Modal, Form, Input, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  PlusOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';
import { PALETTE } from '../theme/tokens';
import { PaymentService } from '../services/payment.service';
import type { Payment } from '../types/api.types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

function WarehouseFinance() {
  const [activeTab, setActiveTab] = useState('income');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const isExpense = activeTab === 'expense';

  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [totalDebt, setTotalDebt] = useState<number>(0);

  const loadData = async (page: number) => {
    setLoading(true);
    try {
      const res = await PaymentService.getPayments(page, pageSize);
      setPayments(res.results);
      setTotal(res.count);
      
      const debts = await PaymentService.getAllDebts();
      const sum = debts.reduce((acc, d) => acc + parseFloat(d.amount || '0'), 0);
      setTotalDebt(sum);
    } catch (err) {
      console.error(err);
      message.error(t('finance.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage]);

  const incomeData = payments
    .filter(p => parseFloat(p.amount) >= 0)
    .map(p => ({
      id: p.id,
      date: new Date(p.operation_time || p.paid_at || p.created_at || Date.now()).toLocaleDateString('ru-RU'),
      amount: `+${parseFloat(p.amount).toLocaleString()} ${t('common.som')}`,
      paymentType: p.payment_method || t('finance.cash'),
      driver: p.client_name || (p.client_id ? `Клиент ${p.client_id.slice(0, 6)}` : "—"),
      note: p.comment || "—",
    }));

  const expenseData = payments
    .filter(p => parseFloat(p.amount) < 0)
    .map(p => ({
      id: p.id,
      date: new Date(p.operation_time || p.paid_at || p.created_at || Date.now()).toLocaleDateString('ru-RU'),
      amount: `${parseFloat(p.amount).toLocaleString()} ${t('common.som')}`,
      paymentType: p.payment_method || t('finance.cash'),
      recipient: p.client_name || (p.client_id ? `Клиент ${p.client_id.slice(0, 6)}` : "—"),
      note: p.comment || "—",
    }));

  const balances = [
    { title: t('finance.currentDebt'), value: `${totalDebt.toLocaleString()} ${t('common.som')}`, color: PALETTE.error },
    { title: t('finance.totalTransactions'), value: `${total}`, color: PALETTE.primary, icon: <ArrowUpOutlined /> },
  ];

  const incomeColumns = [
    { title: t('finance.dateCol'), dataIndex: 'date', key: 'date' },
    { 
      title: t('finance.amountCol'), 
      dataIndex: 'amount', 
      key: 'amount',
      render: (text: string) => <span style={{ color: PALETTE.success, fontWeight: 600 }}>{text}</span>
    },
    { 
      title: t('finance.paymentTypeCol'), 
      dataIndex: 'paymentType', 
      key: 'paymentType',
      render: (type: string) => {
        const isCash = type === t('finance.cash') || type === 'Наличный';
        return (
          <Tag color={isCash ? 'success' : 'processing'} style={{ borderRadius: '4px' }}>
            {type}
          </Tag>
        );
      }
    },
    { title: t('finance.driverCol'), dataIndex: 'driver', key: 'driver' },
    { title: t('finance.noteCol'), dataIndex: 'note', key: 'note' },
  ];

  const expenseColumns = [
    { title: t('finance.dateCol'), dataIndex: 'date', key: 'date' },
    { 
      title: t('finance.amountCol'), 
      dataIndex: 'amount', 
      key: 'amount',
      render: (text: string) => <span style={{ color: PALETTE.error, fontWeight: 600 }}>{text}</span>
    },
    { 
      title: t('finance.paymentTypeCol'), 
      dataIndex: 'paymentType', 
      key: 'paymentType',
      render: (type: string) => {
        const isCash = type === t('finance.cash') || type === 'Наличный';
        return (
          <Tag style={{ color: isCash ? '#52c41a' : '#1890ff', background: isCash ? '#f6ffed' : '#e6f4ff', borderColor: 'transparent', borderRadius: '4px' }}>
            {type}
          </Tag>
        );
      }
    },
    { 
      title: t('finance.recipientCol'), 
      dataIndex: 'recipient', 
      key: 'recipient',
      render: (text: string) => (
        <span style={{ background: 'var(--color-bg-layout, #f5f5f5)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: 'var(--color-text-secondary, #595959)' }}>
          {text}
        </span>
      )
    },
    { title: t('finance.noteCol'), dataIndex: 'note', key: 'note' },
  ];

  const tabItems = [
    { key: 'income', label: t('finance.incomeTab') },
    { key: 'expense', label: t('finance.expenseTab') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Title level={2} style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>{t('finance.title')}</Title>

      <Row gutter={[16, 16]}>
        {balances.map((item, index) => (
          <Col xs={24} md={8} key={index}>
            <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
              <Text type="secondary" style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>{item.title}</Text>
              <div style={{ color: item.color, fontSize: "24px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                {item.icon}
                {item.value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: "16px 24px 0 24px" }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
        </div>
        
        <div style={{ padding: "0 24px 24px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <RangePicker style={{ borderRadius: "6px" }} placeholder={[t('finance.startDate'), t('finance.endDate')]} />
            <Select placeholder={t('finance.paymentTypeFilter')} style={{ width: 150, borderRadius: "6px" }} />
          </div>
          <Button 
            type="primary" 
            danger={isExpense} 
            icon={<PlusOutlined />} 
            style={{ borderRadius: "6px" }}
            onClick={() => setIsModalOpen(true)}
          >
            {isExpense ? t('finance.newExpense') : t('finance.newIncome')}
          </Button>
        </div>

        <Table 
          columns={isExpense ? expenseColumns : (incomeColumns as any)} 
          dataSource={isExpense ? expenseData : (incomeData as any)} 
          loading={loading}
          pagination={{
            current: currentPage,
            total: total,
            pageSize: pageSize,
            showSizeChanger: false,
            onChange: (page) => setCurrentPage(page),
            showTotal: (total, range) => t('common.shown', { from: range[0], to: range[1], total: total.toLocaleString() })
          }} 
          rowKey="id" 
          style={{ padding: "0 24px 24px 24px" }}
        />
      </Card>

      <Modal
        title={isExpense ? t('finance.newExpense') : t('finance.newIncome')}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            {t('common.cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={() => { form.submit(); setIsModalOpen(false); }}>
            {t('common.save')}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label={t('common.date')} name="date" rules={[{ required: true, message: t('common.selectDate') }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          
          <Form.Item label={t('finance.amountLabel')} name="amount" rules={[{ required: true, message: t('common.enterQuantity') }]}>
            <Input addonAfter={t('common.som')} type="number" />
          </Form.Item>

          <Form.Item label={t('finance.paymentTypeLabel')} name="paymentType" rules={[{ required: true, message: t('finance.selectPaymentType') }]}>
            <Select placeholder={t('finance.selectPaymentType')}>
              <Select.Option value="cash">{t('finance.cash')}</Select.Option>
              <Select.Option value="card">{t('finance.cashless')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={isExpense ? t('finance.entityLabelExpense') : t('finance.entityLabel')} name="entity" rules={[{ required: true, message: isExpense ? t('finance.selectRecipient') : t('finance.selectSender') }]}>
            <Select placeholder={isExpense ? t('finance.selectRecipient') : t('finance.selectSender')}>
              <Select.Option value="factory">{t('finance.factory')}</Select.Option>
              <Select.Option value="driver">{t('finance.driver')}</Select.Option>
              <Select.Option value="other">{t('finance.other')}</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={t('common.note')} name="note">
            <TextArea placeholder={t('common.optional')} rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function FactoryFinance() {
  const data = [
    { id: 1, warehouse: "Бишкек - Главный", date: "20.06.2026", amount: "50 000 сом", debt: "350 000 сом" },
    { id: 2, warehouse: "Ош - Региональный", date: "18.06.2026", amount: "120 000 сом", debt: "120 000 сом" },
    { id: 3, warehouse: "Джалал-Абад", date: "15.06.2026", amount: "20 000 сом", debt: "45 000 сом" },
  ];

  const columns = [
    { title: "Склад", dataIndex: 'warehouse', key: 'warehouse', render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: "Дата последней оплаты", dataIndex: 'date', key: 'date' },
    { title: "Сумма оплаты", dataIndex: 'amount', key: 'amount', render: (text: string) => <span style={{ color: PALETTE.success, fontWeight: 600 }}>+{text}</span> },
    { title: "Текущий долг", dataIndex: 'debt', key: 'debt', render: (text: string) => <span style={{ color: PALETTE.error, fontWeight: 600 }}>{text}</span> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Title level={2} style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>История оплат и долги складов</Title>
      <Card bordered={false} style={{ borderRadius: '8px', boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }} styles={{ body: { padding: 0 } }}>
        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={false} 
          rowKey="id" 
          style={{ padding: "24px" }}
        />
      </Card>
    </div>
  );
}

import { useUserStore } from '../store/useUserStore';
import { UserRole } from '../types/enums';

export default function FinancePage() {
  const { user } = useUserStore();
  const isFactory = user?.role === UserRole.Factory;

  return isFactory ? <FactoryFinance /> : <WarehouseFinance />;
}