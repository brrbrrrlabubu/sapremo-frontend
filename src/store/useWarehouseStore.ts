import { create } from 'zustand'

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'in_progress'

interface WarehouseRequest {
    id: string
    warehouseId: string
    product: string
    quantity: number
    status: RequestStatus
    createdAt: string
}

interface WarehouseStore {
    requests: WarehouseRequest[]
    addRequest: (request: WarehouseRequest) => void
    updateStatus: (id: string, status: RequestStatus) => void
    clearRequests: () => void
}

export const useWarehouseStore = create<WarehouseStore>((set) => ({
    requests: [],
    addRequest: (request) =>
        set((state) => ({ requests: [...state.requests, request] })),
    updateStatus: (id, status) =>
        set((state) => ({
            requests: state.requests.map((r) =>
                r.id === id ? { ...r, status } : r
            ),
        })),
    clearRequests: () => set({ requests: [] }),
}))