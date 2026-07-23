/**
 * Финансовые утилиты SAPREMO.
 *
 * ФОРМУЛА ДОЛГА СКЛАДА:
 *   Долг = Сумма принятого товара (по factory_price) - Сумма всех оплат
 *
 * Важно: amount в Payment может быть отрицательным (расход) или положительным (доход/оплата).
 * totalDebt считается не суммой debt-объектов, а вычитанием оплат из стоимости приёмки.
 */

import type { Payment } from '../types/api.types';

// ─── Типы ────────────────────────────────────────────────────────────────────
export interface DebtSnapshot {
  warehouseId: string;
  receivedTotal: number;   // Сумма принятого товара
  paidTotal: number;       // Сумма оплат
  debt: number;            // receivedTotal - paidTotal (может быть отрицательным = переплата)
}

export interface FinanceSummary {
  totalIncome: number;    // Сумма всех положительных платежей
  totalExpense: number;   // Сумма всех отрицательных платежей (абс. значение)
  netBalance: number;     // totalIncome - totalExpense
}

// ─── Парсинг суммы ────────────────────────────────────────────────────────────
/**
 * Безопасный парсинг суммы из строки.
 * API возвращает amount как строку ("1500.00", "-200.50").
 * parseFloat("") → NaN, parseFloat(undefined) → NaN — оба случая → 0.
 */
export function parseMoney(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

// ─── Форматирование ───────────────────────────────────────────────────────────
/**
 * Форматирует число в строку валюты (локаль ru-RU).
 * Примеры: 1500 → "1 500", 1500.5 → "1 500,50"
 */
export function formatMoney(
  value: number,
  options: { showDecimals?: boolean; currency?: string } = {}
): string {
  const { showDecimals = false, currency } = options;

  const formatted = value.toLocaleString('ru-RU', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return currency ? `${formatted} ${currency}` : formatted;
}

/**
 * Форматирует сумму со знаком: "+1 500 сом" или "-500 сом"
 */
export function formatMoneyWithSign(value: number, currency = 'сом'): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatMoney(value)} ${currency}`;
}

// ─── Агрегация платежей ───────────────────────────────────────────────────────
/**
 * Разбивает список платежей на доходы и расходы, считает итоги.
 */
export function aggregatePayments(payments: Payment[]): FinanceSummary {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const p of payments) {
    const amount = parseMoney(p.amount);
    if (amount >= 0) {
      totalIncome += amount;
    } else {
      totalExpense += Math.abs(amount);
    }
  }

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  };
}

// ─── Расчёт долга склада ──────────────────────────────────────────────────────
/**
 * Основная формула: Долг склада = Принятый товар - Оплаты
 *
 * @param receivedItems — позиции приёмки с qty и factory_price
 * @param payments      — все оплаты склада (только положительные считаются как оплата долга)
 */
export function calculateWarehouseDebt(
  receivedItems: Array<{ actual_qty: number | null; factory_price?: string; expected_qty: number }>,
  payments: Payment[]
): DebtSnapshot {
  // Сумма принятого товара = actual_qty * factory_price (если actual_qty null — берём expected_qty)
  const receivedTotal = receivedItems.reduce((acc, item) => {
    const qty = item.actual_qty ?? item.expected_qty;
    const price = parseMoney(item.factory_price);
    return acc + qty * price;
  }, 0);

  // Сумма оплат — только положительные платежи засчитываются как погашение долга
  const paidTotal = payments.reduce((acc, p) => {
    const amount = parseMoney(p.amount);
    return amount > 0 ? acc + amount : acc;
  }, 0);

  const debt = receivedTotal - paidTotal;

  return {
    warehouseId: '', // заполняется вызывающим кодом
    receivedTotal,
    paidTotal,
    debt,
  };
}

/**
 * Упрощённый расчёт долга из API-ответа (если бэк возвращает debt-объекты).
 * Используется как fallback когда детальные данные приёмки недоступны.
 */
export function sumDebtsFromApi(
  debts: Array<{ amount?: string | null }>
): number {
  return debts.reduce((acc, d) => acc + parseMoney(d.amount), 0);
}

// ─── Фильтрация платежей ──────────────────────────────────────────────────────
export function filterIncomePayments(payments: Payment[]): Payment[] {
  return payments.filter((p) => parseMoney(p.amount) >= 0);
}

export function filterExpensePayments(payments: Payment[]): Payment[] {
  return payments.filter((p) => parseMoney(p.amount) < 0);
}

/**
 * Форматирует дату платежа — с fallback на текущий момент.
 * API может вернуть operation_time, paid_at или created_at.
 */
export function getPaymentDate(
  payment: Pick<Payment, 'operation_time' | 'paid_at' | 'created_at'>
): string {
  const raw = payment.operation_time || payment.paid_at || payment.created_at;
  if (!raw) return new Date().toLocaleDateString('ru-RU');
  return new Date(raw).toLocaleDateString('ru-RU');
}
