import { axiosClient } from '../api/axiosClient';
import { SyncStatusSchema } from '../schemas/apiSchemas';
import { z } from 'zod';

export class SyncService {
  public static async getInitialData<T>(): Promise<T> {
    const response = await axiosClient.get('/sync/initial/');
    return response.data as T;
  }

  public static async pullData<T>(): Promise<T> {
    const response = await axiosClient.get('/sync/pull/');
    return response.data as T;
  }

  public static async pushData(payload: Record<string, unknown>): Promise<{ success: boolean }> {
    const response = await axiosClient.post('/sync/push/', payload);
    const data = z.object({ success: z.boolean() }).parse(response.data);
    return { success: data.success };
  }

  public static async getStatus(): Promise<z.infer<typeof SyncStatusSchema>> {
    const response = await axiosClient.get('/sync/status/');
    return SyncStatusSchema.parse(response.data);
  }
}
