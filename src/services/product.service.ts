import { axiosClient } from '../api/axiosClient';
import { ProductSchema } from '../schemas/apiSchemas';
import type { Product, PaginatedResponse } from '../types/api.types';
import { z } from 'zod';

export class ProductService {
  public static async getProducts(page = 1, pageSize = 20): Promise<PaginatedResponse<Product>> {
    const response = await axiosClient.get('/products/', {
      params: { page, page_size: pageSize },
    });

    const paginatedSchema = z.object({
      count: z.number(),
      next: z.string().nullable(),
      previous: z.string().nullable(),
      results: z.array(ProductSchema),
    });

    return paginatedSchema.parse(response.data) as PaginatedResponse<Product>;
  }

  public static async getProduct(id: string): Promise<Product> {
    const response = await axiosClient.get(`/products/${id}/`);
    return ProductSchema.parse(response.data);
  }

  public static async getProductByBarcode(barcode: string): Promise<Product> {
    const response = await axiosClient.get(`/products/barcode/${barcode}/`);
    return ProductSchema.parse(response.data);
  }

  public static async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await axiosClient.post('/products/', product);
    return ProductSchema.parse(response.data);
  }

  public static async updateProductFull(id: string, product: Omit<Product, 'id'>): Promise<Product> {
    const response = await axiosClient.put(`/products/${id}/`, product);
    return ProductSchema.parse(response.data);
  }

  public static async updateProductPartial(id: string, patch: Partial<Omit<Product, 'id'>>): Promise<Product> {
    const response = await axiosClient.patch(`/products/${id}/`, patch);
    return ProductSchema.parse(response.data);
  }

  public static async deleteProduct(id: string): Promise<void> {
    await axiosClient.delete(`/products/${id}/`);
  }
}
