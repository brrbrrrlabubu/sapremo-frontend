import { axiosClient } from '../api/axiosClient';

export class StatsService {
  public static async getKpis() {
    try {
      const response = await axiosClient.get('/stats/kpis');
      return response.data;
    } catch (e) {
      console.warn("KPIs endpoint failed", e);
      return null;
    }
  }

  public static async getTopProducts() {
    try {
      const response = await axiosClient.get('/stats/top-products');
      return response.data;
    } catch (e) {
      console.warn("Top products endpoint failed", e);
      return [];
    }
  }

  public static async getTopDrivers() {
    try {
      const response = await axiosClient.get('/stats/top-drivers');
      return response.data;
    } catch (e) {
      console.warn("Top drivers endpoint failed", e);
      return [];
    }
  }
}
