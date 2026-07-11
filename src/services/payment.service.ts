import { z } from 'zod';
import { axiosClient } from '../api/axiosClient';
import { PaymentSchema, DebtSchema } from '../schemas/apiSchemas';
import type { Payment } from '../types/api.types';

export class PaymentService {
  public static async createPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    const response = await axiosClient.post('/payments/', payment);
    return PaymentSchema.parse(response.data);
  }

  public static async getAllDebts(): Promise<Array<z.infer<typeof DebtSchema>>> {
    const response = await axiosClient.get('/payments/debts/all/');
    return z.array(DebtSchema).parse(response.data);
  }
}
