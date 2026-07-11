import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      menu: {
        warehouseRequests: 'Заявки от склада',
        products: 'Управление товарами',
        analytics: 'Аналитика',
      },
      status: {
        pending: 'Ожидает обработки',
        approved: 'Утверждена',
        rejected: 'Отклонена',
        completed: 'Выполнена',
      },
      actions: {
        approve: 'Утвердить',
        reject: 'Отклонить',
        ship: 'Отгрузить',
        save: 'Сохранить',
        cancel: 'Отмена',
      },
      validation: {
        insufficientStock: 'Недостаточно товара на основном складе завода!',
      },
    },
  },
  en: {
    translation: {
      menu: {
        warehouseRequests: 'Warehouse Requests',
        products: 'Product Management',
        analytics: 'Analytics',
      },
      status: {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        completed: 'Completed',
      },
      actions: {
        approve: 'Approve',
        reject: 'Reject',
        ship: 'Ship',
        save: 'Save',
        cancel: 'Cancel',
      },
      validation: {
        insufficientStock: 'Insufficient stock at the main factory warehouse!',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru', // Язык по умолчанию, будем синхронизировать его со стором
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false, // React уже защищает от XSS
    },
  });

export default i18n;