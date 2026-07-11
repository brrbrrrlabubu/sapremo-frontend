import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { 
  WarehouseRequest, 
  RequestStatus, 
  isValidStatusTransition, 
  checkStockAvailability, 
  calculateUpdatedStock 
} from '../utils/requestAlgorithms';

// Описываем контракт для стора Нурсултана, чтобы TypeScript не ругался до того,
// как Нурсултан напишет свой Zustand-стор.
interface RequestStorePlaceholder {
  updateRequestStatus: (id: string, status: RequestStatus) => Promise<void>;
  updateFactoryStock: (newStock: Record<string, number>) => Promise<void>;
  factoryStock: Record<string, number>;
}

export const useRequestOperations = (store: RequestStorePlaceholder) => {
  const { t } = useTranslation();

  const handleStatusChange = async (request: WarehouseRequest, nextStatus: RequestStatus) => {
    // 1. Проверяем, допустим ли такой переход по нашей State Machine
    if (!isValidStatusTransition(request.status, nextStatus)) {
      message.error('Ошибка: Неверная последовательность смены статуса!');
      return false;
    }

    // 2. Бизнес-логика: если заявку утверждают (APPROVED), проверяем склад завода
    if (nextStatus === 'APPROVED') {
      const { isAvailable, deficit } = checkStockAvailability(request.items, store.factoryStock);

      if (!isAvailable) {
        // Формируем понятный лог дефицита для менеджера
        const deficitDetails = deficit
          .map(d => `Товар ${d.productId} (Надо: ${d.requested}, В наличии: ${d.available})`)
          .join(', ');
        
        message.error(`${t('validation.insufficientStock')} Дефицит: ${deficitDetails}`);
        return false;
      }

      // Если товара хватает — уменьшаем виртуальные остатки на заводе (бронируем)
      const newStock = calculateUpdatedStock(request.items, store.factoryStock);
      await store.updateFactoryStock(newStock);
    }

    // 3. Если все проверки прошли — меняем статус самой заявки
    await store.updateRequestStatus(request.id, nextStatus);
    
    // Выводим мультиязычное сообщение об успехе
    const statusText = t(`status.${nextStatus.toLowerCase()}`);
    message.success(`Статус заявки успешно изменен на: "${statusText}"`);
    
    return true;
  };

  return { handleStatusChange };
};