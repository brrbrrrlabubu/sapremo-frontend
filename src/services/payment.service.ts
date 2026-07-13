import { z } from 'zod';
import { axiosClient } from '../api/axiosClient';
import { PaymentSchema, DebtSchema } from '../schemas/apiSchemas';
import type { Payment, PaginatedResponse } from '../types/api.types';

export class PaymentService {
  public static async createPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const response = await axiosClient.post('/payments/', payment);
    return PaymentSchema.parse(response.data);
  }

  public static async getAllDebts(): Promise<Array<z.infer<typeof DebtSchema>>> {
    const response = await axiosClient.get('/payments/debts/all/');
    return z.array(DebtSchema).parse(response.data);
  }

  public static async getPayments(page = 1, pageSize = 20): Promise<PaginatedResponse<Payment>> {
    const response = await axiosClient.get('/payments/', {
      params: { page, page_size: pageSize },
    });

    const paginatedPayments = z.object({
      count: z.number(),
      next: z.string().nullable(),
      previous: z.string().nullable(),
      results: z.array(PaymentSchema),
    });

    return paginatedPayments.parse(response.data) as PaginatedResponse<Payment>;
  }
}
