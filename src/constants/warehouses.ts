export const WAREHOUSES = [
  { id: "1", name: "Главный склад Завод", type: "main", address: "г. Бишкек, ул. Промышленная 5" },
  { id: "2", name: "Транзитный склад Чуй", type: "transit", address: "Чуйская обл., с. Лебединовка" },
] as const;

export type Warehouse = typeof WAREHOUSES[number];
