import { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Typography, App } from 'antd';
import { useTranslation } from 'react-i18next';
import { InboxOutlined, FallOutlined, WalletOutlined, BankOutlined } from '@ant-design/icons';
import { StatsService } from '../services/stats.service';
import { DriverService } from '../services/driver.service';
import { useAccess } from '../hooks/useAccess';
import { useUserStore } from '../store/useUserStore';
import { UserRole } from '../types/enums';

const { Text, Title } = Typography;

function WarehouseDashboard() {
  const { message } = App.useApp();
  const { t } = useTranslation();
  const { user } = useUserStore();
  const isWarehouseManager = (user?.role as string) === UserRole.WarehouseManager || (user?.role as string) === 'warehouse_manager';
  
  const [kpiData, setKpiData] = useState<any>(null);
  const [driverDebtSum, setDriverDebtSum] = useState<number>(0);

  const loadData = useCallback(async () => {
    // Если зав. склад, не запрашиваем финансовую и общую статистику складов, к которой у него нет доступа
    if (isWarehouseManager) return;

    try {
      const [kpis, debtsResp] = await Promise.all([
        StatsService.getKpis(),
        DriverService.getDebts({ size: 5 })
      ]);
      
      if (kpis) setKpiData(kpis);
      if (debtsResp?.content) {
        setDriverDebtSum(debtsResp.content.reduce((sum: number, d: any) => sum + (d.totalDebt || 0), 0));
      }
    } catch (e) {
      console.error(e);
      message.error(t('dashboard.errorLoading'));
    }
  }, [message, t, isWarehouseManager]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const kpiItems = [
    { title: t('dashboard.stock'), value: kpiData?.total_stock || "0", icon: <InboxOutlined /> },
    { title: t('dashboard.driverDebt'), value: driverDebtSum, icon: <FallOutlined /> },
    { title: t('dashboard.cashbox'), value: kpiData?.cashbox || "0", icon: <WalletOutlined /> },
    { title: t('dashboard.factoryDebt'), value: kpiData?.factory_debt || "0", icon: <BankOutlined /> }
  ];

  return (
    <Row gutter={[16, 16]}>
      {kpiItems.map((kpi, i) => (
        <Col xs={24} sm={12} xl={6} key={i}>
          <Card variant="borderless">
            <Text type="secondary">{kpi.title}</Text>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{kpi.value}</div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default function DashboardPage() {
  const { isFactory } = useAccess();
  const { user } = useUserStore();
  const isWarehouseManager = (user?.role as string) === UserRole.WarehouseManager || (user?.role as string) === 'warehouse_manager';

  return (
    <div style={{ padding: '24px' }}>
      {isFactory ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Title level={3}>Добро пожаловать, Завод!</Title>
          <p>Используйте меню слева для работы с приёмкой и отгрузкой.</p>
        </div>
      ) : isWarehouseManager ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Title level={3}>Добро пожаловать, Зав. складом!</Title>
          <p>Используйте меню слева для работы со складскими заявками.</p>
        </div>
      ) : (
        <WarehouseDashboard />
      )}
    </div>
  );
}