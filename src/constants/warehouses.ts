<<<<<<< HEAD
import type { Warehouse } from '../types/warehouse';

export const MOCK_WAREHOUSES: Warehouse[] = [
  { id: "1", name: "Главный склад Завод", type: "main", address: "г. Бишкек, ул. Промышленная 5", status: "active" },
  { id: "2", name: "Транзитный склад Чуй", type: "transit", address: "Чуйская обл., с. Лебединовка", status: "active" },
];
=======
export const WAREHOUSES = [
  { id: "1", name: "Главный склад Завод", type: "main", address: "г. Бишкек, ул. Промышленная 5" },
  { id: "2", name: "Транзитный склад Чуй", type: "transit", address: "Чуйская обл., с. Лебединовка" },
] as const;

export type Warehouse = typeof WAREHOUSES[number];
>>>>>>> 62717d2 (initial commit: structure, store, and finance page logic)
