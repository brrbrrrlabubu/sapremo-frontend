import axios from 'axios'
import { z } from 'zod'

const BASE_URL = (import.meta as { env: { VITE_API_URL?: string } }).env.VITE_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const api = {
    get: <T>(endpoint: string, schema?: z.ZodType<T>) =>
        apiClient.get<T>(endpoint).then((res) => {
            if (schema) return schema.parse(res.data)
            return res.data
        }),
    post: <T>(endpoint: string, body: unknown, schema?: z.ZodType<T>) =>
        apiClient.post<T>(endpoint, body).then((res) => {
            if (schema) return schema.parse(res.data)
            return res.data
        }),
    put: <T>(endpoint: string, body: unknown, schema?: z.ZodType<T>) =>
        apiClient.put<T>(endpoint, body).then((res) => {
            if (schema) return schema.parse(res.data)
            return res.data
        }),
    delete: <T>(endpoint: string) =>
        apiClient.delete<T>(endpoint).then((res) => res.data),
}