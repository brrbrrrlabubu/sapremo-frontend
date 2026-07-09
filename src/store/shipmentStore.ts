import { create } from 'zustand';

interface ShipmentState {
  shipments: any[];
  addShipment: (s: any) => void;
  updateStatus: (id: string, status: string) => void;
  deleteShipment: (id: string) => void;
}

export const useShipmentStore = create<ShipmentState>((set) => ({
  shipments: [], // Изначально пусто, позже можно загрузить из Dexie
  addShipment: (s) => set((state) => ({ shipments: [s, ...state.shipments] })),
  updateStatus: (id, status) => set((state) => ({
    shipments: state.shipments.map(s => s.id === id ? { ...s, status } : s)
  })),
  deleteShipment: (id) => set((state) => ({
    shipments: state.shipments.filter(s => s.id !== id)
  })),
}));