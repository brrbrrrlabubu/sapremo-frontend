import type { Warehouse } from '../types/warehouse';

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: "1", name: "Главный склад Завод", type: "main", address: "г. Бишкек, ул. Промышленная 5", status: "active" },
  { id: "2", name: "Транзитный склад Чуй", type: "transit", address: "Чуйская обл., с. Лебединовка", status: "active" },
];