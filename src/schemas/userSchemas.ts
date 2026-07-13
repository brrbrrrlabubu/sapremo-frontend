import { z } from 'zod'

export const loginSchema = z.object({
    name: z.string().min(2, 'Имя должно быть минимум 2 символа'),
    role: z.enum(['admin', 'factory', 'manager', 'accountant']),
})

export const shipmentSchema = z.object({
    product: z.string().min(1, 'Укажите продукт'),
    quantity: z.number().positive('Количество должно быть больше 0'),
    price: z.number().positive('Цена должна быть больше 0'),
    storageExpiry: z.string().min(1, 'Укажите срок хранения'),
    manufactureDate: z.string().min(1, 'Укажите дату производства'),
    date: z.string().min(1, 'Укажите дату'),
})

export type LoginForm = z.infer<typeof loginSchema>
export type ShipmentForm = z.infer<typeof shipmentSchema>