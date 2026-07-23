import React from 'react';
import { Alert, Badge, Button, Space, Spin } from 'antd';
import {
  WifiOutlined,
  DisconnectOutlined,
  SyncOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * Вставь в MainLayout сразу после Header:
 *
 * <NetworkStatusBar />
 * <Content>...</Content>
 */
export const NetworkStatusBar: React.FC = () => {
  const { isOnline, pendingCount, isSyncing, triggerSync } = useNetworkStatus();

  // Онлайн и нет ожидающих — баннер не нужен
  if (isOnline && pendingCount === 0) return null;

  if (!isOnline) {
    return (
      <Alert
        type="warning"
        showIcon
        icon={<DisconnectOutlined />}
        message={
          <Space>
            <span>Нет соединения с сервером. Изменения сохраняются локально.</span>
            {pendingCount > 0 && (
              <Badge
                count={pendingCount}
                style={{ backgroundColor: '#faad14' }}
                title={`${pendingCount} операций ожидают синхронизации`}
              />
            )}
          </Space>
        }
        style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none' }}
      />
    );
  }

  // Онлайн, но есть pending-операции — идёт или ждёт синхронизации
  return (
    <Alert
      type="info"
      showIcon
      icon={isSyncing ? <SyncOutlined spin /> : <ClockCircleOutlined />}
      message={
        <Space>
          <WifiOutlined style={{ color: '#52c522' }} />
          <span>
            {isSyncing
              ? `Синхронизация... (${pendingCount} операций)`
              : `${pendingCount} операций ожидают отправки`}
          </span>
          {!isSyncing && (
            <Button
              size="small"
              type="link"
              icon={<SyncOutlined />}
              onClick={triggerSync}
              style={{ padding: 0 }}
            >
              Синхронизировать сейчас
            </Button>
          )}
          {isSyncing && <Spin size="small" />}
        </Space>
      }
      style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none' }}
    />
  );
};
