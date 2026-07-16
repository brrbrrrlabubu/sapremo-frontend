import { Tabs, Typography } from 'antd';
import ReceivingPage from './ReceivingPage';
import ShipmentPage from './ShipmentPage';
import {
  ImportOutlined,
  ExportOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

export default function FactoryOperationsPage() {
  const items = [
    {
      key: '1',
      label: (
        <span>
          <ImportOutlined />
          Контроль приёмки
        </span>
      ),
      children: <ReceivingPage />,
    },
    {
      key: '2',
      label: (
        <span>
          <ExportOutlined />
          Отгрузки
        </span>
      ),
      children: <ShipmentPage />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Title level={2} style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
        Завод
      </Title>

      <Tabs
        defaultActiveKey="1"
        items={items}
        size="large"
        tabBarStyle={{ marginBottom: 24 }}
      />
    </div>
  );
}
