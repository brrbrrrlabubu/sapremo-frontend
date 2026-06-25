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