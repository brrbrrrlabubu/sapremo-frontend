// 1. Определение типов данных для логики заявок
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface RequestItem {
  productId: string;
  quantity: number;
}

export interface WarehouseRequest {
  id: string;
  warehouseId: string;
  items: RequestItem[];
  status: RequestStatus;
  createdAt: string;
  comment?: string;
}

// Простая структура остатков завода: { [id_товара]: количество_на_складе }
export interface FactoryStock {
  [productId: string]: number;
}

/**
 * 2. Алгоритм Валидации Переходов Статусов (State Machine)
 * Запрещает хаотичное изменение статусов.
 */
export const isValidStatusTransition = (current: RequestStatus, next: RequestStatus): boolean => {
  const allowedTransitions: Record<RequestStatus, RequestStatus[]> = {
    PENDING: ['APPROVED', 'REJECTED'],     // Из ожидания — только в аппрув или отказ
    APPROVED: ['COMPLETED', 'REJECTED'],   // Из аппрува — в выполненные или отмену
    REJECTED: [],                          // Финальный статус, менять нельзя
    COMPLETED: [],                         // Финальный статус, менять нельзя
  };

  return allowedTransitions[current].includes(next);
};

/**
 * 3. Алгоритм Проверки Доступности Товара на Заводе
 * Проверяет, хватает ли на заводе товара для покрытия заявки склада.
 * Возвращает объект с флагом доступности и списком дефицитных позиций.
 */
export interface DeficitItem {
  productId: string;
  requested: number;
  available: number;
}

export const checkStockAvailability = (
  requestItems: RequestItem[],
  factoryStock: FactoryStock
): { isAvailable: boolean; deficit: DeficitItem[] } => {
  const deficit: DeficitItem[] = [];

  requestItems.forEach((item) => {
    const available = factoryStock[item.productId] || 0;
    if (available < item.quantity) {
      deficit.push({
        productId: item.productId,
        requested: item.quantity,
        available: available,
      });
    }
  });

  return {
    isAvailable: deficit.length === 0,
    deficit,
  };
};

/**
 * 4. Алгоритм Пересчета Виртуальных Остатков Завода
 * Вычитает утвержденные товары из остатков завода.
 */
export const calculateUpdatedStock = (
  requestItems: RequestItem[],
  currentStock: FactoryStock
): FactoryStock => {
  const updatedStock = { ...currentStock };

  requestItems.forEach((item) => {
    if (updatedStock[item.productId] !== undefined) {
      updatedStock[item.productId] = Math.max(0, updatedStock[item.productId] - item.quantity);
    }
  });

  return updatedStock;
};