import { Tabs, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import ReceivingPage from './ReceivingPage';
import ShipmentPage from './ShipmentPage';
import ReturnsPage from './ReturnsPage';
import { 
  ImportOutlined, 
  ExportOutlined, 
  UndoOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

export default function FactoryOperationsPage() {
  const { t } = useTranslation();

  const items = [
    {
      key: '1',
      label: (
        <span>
          <ImportOutlined />
          {t('menu.receiving')}
        </span>
      ),
      children: <ReceivingPage />,
    },
    {
      key: '2',
      label: (
        <span>
          <ExportOutlined />
          {t('menu.shipments')}
        </span>
      ),
      children: <ShipmentPage />,
    },
    {
      key: '3',
      label: (
        <span>
          <UndoOutlined />
          {t('menu.returns')}
        </span>
      ),
      children: <ReturnsPage />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Title level={2} style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
        {t('menu.factory', 'Завод')}
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
