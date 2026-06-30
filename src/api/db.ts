import Dexie, { type Table } from 'dexie';

// 1. Описываем интерфейсы для таблиц (это нужно для TypeScript)
export interface Warehouse {
  id?: number; // Автоинкрементный локальный ID
  name: string;
  location?: string;
}

export interface Product {
  id?: number;
  name: string;
  sku: string;
  price: number;
}

export interface Transaction {
  id?: number;
  productId: number;
  warehouseId: number;
  type: 'income' | 'outcome'; // Приход или Расход
  quantity: number;
  expectedQuantity?: number;  // Для расчета излишков/недостач
  actualQuantity?: number;    // Сколько посчитали по факту
  debt?: number;              // Сумма долга, если есть расхождения
  createdAt: number;          // Timestamp
}

// 2. Объявляем класс нашей базы данных
class SapremoDatabase extends Dexie {
  warehouses!: Table<Warehouse, number>;
  products!: Table<Product, number>;
  transactions!: Table<Transaction, number>;

  constructor() {
    super('SapremoDatabase');
    
    // Определяем индексы для быстрого поиска и связей.
    // Обычные поля (не индексы) здесь перечислять не нужно!
    this.version(1).stores({
      warehouses: '++id, name',
      products: '++id, sku, name',
      transactions: '++id, productId, warehouseId, type, createdAt'
    });
  }
}

// Экспортируем единственный экземпляр БД на всё приложение (Singleton)
export const db = new SapremoDatabase();

// Функция для расчета излишков, недостач и долгов по транзакции
export interface CalculatedTransaction extends Transaction {
  diff: number; 
  status: 'excess' | 'shortage' | 'match'; 
}

export function calculateTransactionMetrics(transaction: Transaction): CalculatedTransaction {
  // Используем оператор || 0, чтобы защититься от undefined
  const actual = transaction.actualQuantity || 0;
  const expected = transaction.expectedQuantity || 0;
  const diff = actual - expected;
  
  let status: 'excess' | 'shortage' | 'match' = 'match';
  let debt = 0;

  if (diff > 0) {
    status = 'excess';
  } else if (diff < 0) {
    status = 'shortage';
    debt = Math.abs(diff) * 100; // Временная цена для расчета долга
  }

  return {
    ...transaction,
    diff,
    status,
    debt
  };
}

// Функция для подготовки данных для графиков Recharts (Dashboard)
export interface DashboardData {
  name: string;
  expected: number;
  actual: number;
  totalDebt: number;
}

export function prepareDashboardData(transactions: CalculatedTransaction[]): DashboardData[] {
  return transactions.map((t, index) => ({
    name: `Накладная №${t.id || index + 1}`,
    expected: t.expectedQuantity || 0, // Защита от undefined
    actual: t.actualQuantity || 0,     // Защита от undefined
    totalDebt: t.debt || 0
  }));
}