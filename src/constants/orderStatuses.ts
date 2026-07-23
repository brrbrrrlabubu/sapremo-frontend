/**
 * Единый реестр статусов для заявок водителей и складских заявок.
 * Ранее getStatusConfig дублировался в DashboardPage, DriverRequestsPage, WarehouseRequestsPage.
 *
 * Теперь — один источник, один тип.
 */

// ─── Статусы заявок водителей (Driver Orders) ────────────────────────────────
export const DRIVER_ORDER_STATUSES = {
  NEW:        { color: 'warning',    label: 'Новая',         labelKg: 'Жаңы',       labelEn: 'New'        },
  CONFIRMED:  { color: 'processing', label: 'Подтверждена',  labelKg: 'Ырасталды',  labelEn: 'Confirmed'  },
  MODIFIED:   { color: 'warning',    label: 'Изменена',      labelKg: 'Өзгөртүлдү', labelEn: 'Modified'   },
  REJECTED:   { color: 'error',      label: 'Отклонена',     labelKg: 'Четке кагылды', labelEn: 'Rejected' },
  DISPATCHED: { color: 'success',    label: 'Отгружена',     labelKg: 'Жөнөтүлдү', labelEn: 'Dispatched' },
} as const;

export type DriverOrderStatus = keyof typeof DRIVER_ORDER_STATUSES;

// ─── Статусы складских заявок (Warehouse Orders) ─────────────────────────────
export const WAREHOUSE_ORDER_STATUSES = {
  pending:   { color: 'warning',    label: 'Отправлено',        antColor: '#faad14' },
  accepted:  { color: 'processing', label: 'Принято заводом',   antColor: '#1890ff' },
  completed: { color: 'success',    label: 'Выдано',            antColor: '#52c41a' },
  cancelled: { color: 'error',      label: 'Отменено',          antColor: '#ff4d4f' },
} as const;

export type WarehouseOrderStatus = keyof typeof WAREHOUSE_ORDER_STATUSES;

// ─── Статусы приёмки (Reception) ─────────────────────────────────────────────
export const RECEPTION_STATUSES = {
  pending:   { color: 'warning',    label: 'Ожидается'  },
  arrived:   { color: 'processing', label: 'Прибыло'    },
  partial:   { color: 'warning',    label: 'Частично'   },
  completed: { color: 'success',    label: 'Принято'    },
} as const;

export type ReceptionStatus = keyof typeof RECEPTION_STATUSES;

// ─── Статусы возвратов (Returns) ─────────────────────────────────────────────
export const RETURN_STATUSES = {
  PENDING:  { color: 'warning', label: 'На проверке' },
  ACCEPTED: { color: 'success', label: 'Принято'     },
  REJECTED: { color: 'error',   label: 'Отклонено'   },
} as const;

export type ReturnStatus = keyof typeof RETURN_STATUSES;

// ─── Статусы отгрузок (Shipments) ────────────────────────────────────────────
export const SHIPMENT_STATUSES = {
  pending:   { color: 'warning',    label: 'В ожидании' },
  shipped:   { color: 'success',    label: 'Отгружено'  },
  cancelled: { color: 'error',      label: 'Отменено'   },
} as const;

export type ShipmentStatus = keyof typeof SHIPMENT_STATUSES;

// ─── Хелперы ─────────────────────────────────────────────────────────────────

/** Получить конфиг статуса заявки водителя (с fallback) */
export function getDriverOrderStatus(status: string) {
  return DRIVER_ORDER_STATUSES[status as DriverOrderStatus] ?? {
    color: 'default',
    label: status || '—',
  };
}

/** Получить конфиг статуса складской заявки (с fallback) */
export function getWarehouseOrderStatus(status: string) {
  const key = status?.toLowerCase() as WarehouseOrderStatus;
  return WAREHOUSE_ORDER_STATUSES[key] ?? {
    color: 'default',
    label: status || '—',
    antColor: '#d9d9d9',
  };
}

/** Получить конфиг статуса приёмки (с fallback) */
export function getReceptionStatus(status: string) {
  const key = status?.toLowerCase() as ReceptionStatus;
  return RECEPTION_STATUSES[key] ?? { color: 'default', label: status || '—' };
}

/** Получить конфиг статуса возврата (с fallback) */
export function getReturnStatus(status: string) {
  return RETURN_STATUSES[status as ReturnStatus] ?? { color: 'default', label: status || '—' };
}

/** Получить конфиг статуса отгрузки (с fallback) */
export function getShipmentStatus(status: string) {
  const key = status?.toLowerCase() as ShipmentStatus;
  return SHIPMENT_STATUSES[key] ?? { color: 'default', label: status || '—' };
}

/**
 * Определяет, можно ли отменить складскую заявку.
 * Только статус 'pending' — до принятия заводом.
 */
export function canCancelWarehouseOrder(status: string): boolean {
  return status?.toLowerCase() === 'pending';
}

/**
 * Доступные действия для заявки водителя по текущему статусу.
 */
export function getDriverOrderActions(status: string): {
  canConfirm: boolean;
  canReject: boolean;
  canDispatch: boolean;
} {
  return {
    canConfirm:  status === 'NEW',
    canReject:   status === 'NEW',
    canDispatch: status === 'CONFIRMED',
  };
}
