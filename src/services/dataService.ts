// src/services/dataService.ts
export interface Shipment {
  id: string;
  docNumber: string;
  date: string;
  warehouse: string;
  client: string;
  status: "shipped" | "transit" | "discrepancy" | "defective"; 
  comment: string;
  amount: number; 
}

const initialShipments: Shipment[] = [
  { id: "1", docNumber: "НАК-00241", date: "2026-06-29", warehouse: "Главный склад Завод", client: "ОсОО 'Мега-Строй'", status: "shipped", comment: "Отгружено в полном объеме.", amount: 45000 },
  { id: "2", docNumber: "НАК-00242", date: "2026-06-30", warehouse: "Транзитный склад Чуй", client: "ИП Ахметов", status: "transit", comment: "Груз передан водителю.", amount: 12000 },
];

const shipmentsList: Shipment[] = [...initialShipments];
let listeners: Array<() => void> = [];

export const dataService = {
  getShipments() {
    return [...shipmentsList];
  },
  addShipment(shipment: Omit<Shipment, "id">) {
    const newShipment = { ...shipment, id: Date.now().toString() };
    shipmentsList.unshift(newShipment);
    this.notify();
    return newShipment;
  },
  updateStatus(id: string, newStatus: Shipment["status"]) {
    const shipment = shipmentsList.find(s => s.id === id);
    if (shipment) {
      shipment.status = newStatus;
    }
    this.notify();
  },
  deleteShipment(id: string) {
    const index = shipmentsList.findIndex(s => s.id === id);
    if (index !== -1) {
      shipmentsList.splice(index, 1);
    }
    this.notify();
  },
  subscribe(listener: () => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  notify() {
    listeners.forEach(l => l());
  }
};