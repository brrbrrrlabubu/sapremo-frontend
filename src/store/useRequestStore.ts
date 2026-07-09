import { create } from 'zustand';
import type { WarehouseRequest, RequestStatus, FactoryStock } from '../utils/requestAlgorithms';

interface RequestStore {
  requests: WarehouseRequest[];
  factoryStock: FactoryStock;
  updateRequestStatus: (id: string, status: RequestStatus) => Promise<void>;
  updateFactoryStock: (newStock: FactoryStock) => Promise<void>;
}

export const useRequestStore = create<RequestStore>((set) => ({
  requests: [
    {
      id: "REQ-001",
      warehouseId: "Главный склад Завод",
      items: [{ productId: "Товар А (Специи)", quantity: 30 }],
      status: "PENDING",
      createdAt: "2026-07-09 14:20",
    },
    {
      id: "REQ-002",
      warehouseId: "Транзитный склад Чуй",
      items: [{ productId: "Товар Б (Упаковка)", quantity: 150 }],
      status: "PENDING",
      createdAt: "2026-07-10 09:15",
    }
  ],
  factoryStock: {
    "Товар А (Специи)": 100,
    "Товар Б (Упаковка)": 80, // Специально вызовет дефицит при попытке утвердить REQ-002
  },
  updateRequestStatus: async (id, status) => {
    set((state) => ({
      requests: state.requests.map((r) => r.id === id ? { ...r, status } : r),
    }));
  },
  updateFactoryStock: async (newStock) => {
    set({ factoryStock: newStock });
  },
}));
