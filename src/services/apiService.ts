import { z } from 'zod';
import { axiosClient } from '../api/axiosClient'; // Импортируем готовый настроенный клиент с перехватчиками!

export const api = {
    get: <T>(endpoint: string, schema?: z.ZodType<T>) =>
        axiosClient.get<T>(endpoint).then((res) => {
            if (schema) return schema.parse(res.data);
            return res.data;
        }),
    post: <T>(endpoint: string, body: unknown, schema?: z.ZodType<T>) =>
        axiosClient.post<T>(endpoint, body).then((res) => {
            if (schema) return schema.parse(res.data);
            return res.data;
        }),
    put: <T>(endpoint: string, body: unknown, schema?: z.ZodType<T>) =>
        axiosClient.put<T>(endpoint, body).then((res) => {
            if (schema) return schema.parse(res.data);
            return res.data;
        }),
    delete: <T>(endpoint: string) =>
        axiosClient.delete<T>(endpoint).then((res) => res.data),
}; 