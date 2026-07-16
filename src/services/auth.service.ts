import { axiosClient } from '../api/axiosClient';
import { LoginResponseSchema } from '../schemas/apiSchemas';
import type { LoginResponse } from '../types/api.types';

export class AuthService {
  public static async login(username: string, password: string, role: string): Promise<LoginResponse> {
    const response = await axiosClient.post('/auth/login', { username, password, role });
  
    const validatedData = LoginResponseSchema.parse(response.data);
  
    localStorage.setItem('access_token', validatedData.access);
    localStorage.setItem('refresh_token', validatedData.refresh);
  
    return validatedData;
  }

  public static async logout(): Promise<void> {
    try {
      // Отправляем топик логаута, чтобы инвалидировать сессию на сервере
      await axiosClient.post('/auth/logout');
    } finally {
      // Очищаем локальное хранилище в любом случае для безопасности данных клиента
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
}
