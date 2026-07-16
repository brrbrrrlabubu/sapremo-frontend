import { driverAxiosClient } from '../api/driverAxiosClient';

export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const DriverService = {
  // --- Warehouse: Drivers ---
  getDrivers: async (params?: { page?: number; size?: number; status?: string; warehouseId?: string; search?: string }) => {
    const response = await driverAxiosClient.get('', { params });
    return response.data;
  },

  getDriver: async (id: string) => {
    const response = await driverAxiosClient.get(`/${id}`);
    return response.data;
  },

  createDriver: async (data: any) => {
    const response = await driverAxiosClient.post('', data);
    return response.data;
  },

  getDebts: async (params?: { warehouseId?: string; minDebt?: number; page?: number; size?: number }) => {
    const response = await driverAxiosClient.get('/debts', { params });
    return response.data;
  },

  // --- Warehouse: Orders ---
  getOrders: async (params?: { page?: number; size?: number; driverId?: string; status?: string }) => {
    const response = await driverAxiosClient.get('/orders', { params });
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await driverAxiosClient.get(`/orders/${id}`);
    return response.data;
  },

  confirmOrder: async (id: string) => {
    const response = await driverAxiosClient.post(`/orders/${id}/confirm`);
    return response.data;
  },

  dispatchOrder: async (id: string) => {
    const response = await driverAxiosClient.post(`/orders/${id}/dispatch`);
    return response.data;
  },

  modifyOrder: async (id: string, data: any) => {
    const response = await driverAxiosClient.post(`/orders/${id}/modify`, data);
    return response.data;
  },

  rejectOrder: async (id: string, data: { comment: string }) => {
    const response = await driverAxiosClient.post(`/orders/${id}/reject`, data);
    return response.data;
  },

  // --- Warehouse: Returns ---
  getReturns: async (params?: { page?: number; size?: number; driverId?: string; status?: string }) => {
    const response = await driverAxiosClient.get('/returns', { params });
    return response.data;
  },

  getReturn: async (id: string) => {
    const response = await driverAxiosClient.get(`/returns/${id}`);
    return response.data;
  },

  acceptReturn: async (id: string) => {
    const response = await driverAxiosClient.post(`/returns/${id}/accept`);
    return response.data;
  },

  rejectReturn: async (id: string) => {
    const response = await driverAxiosClient.post(`/returns/${id}/reject`);
    return response.data;
  }
};
