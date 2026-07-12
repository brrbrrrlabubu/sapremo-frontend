import Dexie, { type Table } from 'dexie'

export interface Product {
    id?: number
    name: string
    quantity: number
    price: number
    storageExpiry: string
    manufactureDate: string
}

class FactoryDatabase extends Dexie {
    products!: Table<Product>

    constructor() {
        super('FactoryDB')
        this.version(1).stores({
            products: '++id, name, quantity, price, storageExpiry, manufactureDate'
        })
    }
}

export const db = new FactoryDatabase()