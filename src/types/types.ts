export interface Product {
  id: number;
  name: string;
  inBox: number;
  quantity: number;
  price: number;
  total: number;
  expiryDate: string;
  productionDate: string;
  warehouseId: string; // ID склада, к которому привязан товар
}