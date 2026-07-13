import { Card, Table, Statistic } from 'antd';
import PageHeader from "../components/PageHeader"; 
import { inventory } from "../constants/products";
import { getInventoryColumns } from "../utils/inventoryColumns";

export default function InventoryPage() {
  const columns = getInventoryColumns();

  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div>
      <PageHeader title="📦 Товары" />
      <Card style={{ marginBottom: 16 }}>
        <Statistic title="Общая стоимость товаров на складе" value={totalValue} suffix="сом" />
      </Card>
      <Card bordered={true} style={{ borderRadius: '4px' }}>
        <Table 
          columns={columns} 
          dataSource={inventory} 
          rowKey="id" 
          pagination={{ pageSize: 10 }} 
        />
      </Card>
    </div>
  );
}