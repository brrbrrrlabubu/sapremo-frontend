import { axiosClient } from '../api/axiosClient';
import { PaymentSchema, DebtSchema } from '../schemas/apiSchemas';
import { safeValidate, safeValidateArray } from '../lib/safeValidate';
import type { Payment, Debt, PaginatedResponse } from '../types/api.types';
import { z } from 'zod';

const PaginatedPaymentsSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(z.unknown()),
});

export class PaymentService {
  /**
   * Создать платёж.
   * При невалидном ответе бросает — это критическая операция.
   */
  public static async createPayment(payment: Omit<Payment, 'id'>): Promise<Payment | null> {
    const response = await axiosClient.post('/payments/', payment);
    const result = safeValidate(PaymentSchema, response.data, 'Создание платежа');
    return result.success ? result.data : null;
  }

  /**
   * Получить все долги складов.
   * Невалидные элементы фильтруются — не роняем весь список.
   */
  public static async getAllDebts(): Promise<Debt[]> {
    const response = await axiosClient.get('/payments/debts/all/');
    const raw = Array.isArray(response.data) ? response.data : [];
    return safeValidateArray(DebtSchema, raw, 'Долги складов');
  }

  /**
   * Постраничная загрузка платежей.
   * Невалидные элементы фильтруются через safeValidateArray.
   */
  public static async getPayments(
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Payment>> {
    const response = await axiosClient.get('/payments/', {
      params: { page, page_size: pageSize },
    });

    const envelope = safeValidate(PaginatedPaymentsSchema, response.data, 'Список платежей');
    if (!envelope.success) {
      return { count: 0, next: null, previous: null, results: [] };
    }

    const validItems = safeValidateArray(
      PaymentSchema,
      envelope.data.results,
      'Платежи (список)'
    );

    return {
      count: envelope.data.count,
      next: envelope.data.next,
      previous: envelope.data.previous,
      results: validItems,
    };
  }
}
