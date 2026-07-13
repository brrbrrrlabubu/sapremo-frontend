import { axiosClient } from '../api/axiosClient';
import { InvoiceSchema } from '../schemas/apiSchemas';
import type { Invoice, PaginatedResponse } from '../types/api.types';
import { z } from 'zod';

export class InvoiceService {
  public static async getInvoices(page = 1, pageSize = 20): Promise<PaginatedResponse<Invoice>> {
    const response = await axiosClient.get('/invoices/', {
      params: { page, page_size: pageSize },
    });

    const paginatedInvoices = z.object({
      count: z.number(),
      next: z.string().nullable(),
      previous: z.string().nullable(),
      results: z.array(InvoiceSchema),
    });

    return paginatedInvoices.parse(response.data) as PaginatedResponse<Invoice>;
  }

  public static async getInvoice(id: string): Promise<Invoice> {
    const response = await axiosClient.get(`/invoices/${id}/`);
    return InvoiceSchema.parse(response.data);
  }

  public static async downloadInvoice(id: string, format: 'pdf' | 'excel'): Promise<void> {
    const response = await axiosClient.get(`/invoices/${id}/${format}/`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `invoice_${id}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}
