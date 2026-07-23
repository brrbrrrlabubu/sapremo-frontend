import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export interface ResponsiveTableConfig {
  isMobile: boolean;
  /** Применяй к <Table scroll={tableScroll}> на десктопе */
  tableScroll: { x: number } | undefined;
  /** CSS-класс для враппера — подключи mobile-cards стили */
  wrapperClassName: string;
}

/**
 * Хук адаптивности таблиц.
 *
 * На мобильных (< 768px):
 *   isMobile = true → рендери карточки вместо таблицы
 *
 * На десктопе:
 *   isMobile = false, tableScroll = { x: minWidth } → горизонтальный скролл
 *
 * Использование:
 *   const { isMobile, tableScroll } = useResponsiveTable(900);
 *   {isMobile
 *     ? <MobileCardList data={data} />
 *     : <Table scroll={tableScroll} ... />
 *   }
 */
export function useResponsiveTable(minTableWidth = 800): ResponsiveTableConfig {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);

    // Устанавливаем начальное значение синхронно
    setIsMobile(mq.matches);

    return () => mq.removeEventListener('change', handler);
  }, []);

  return {
    isMobile,
    tableScroll: isMobile ? undefined : { x: minTableWidth },
    wrapperClassName: isMobile ? 'sapremo-table--mobile' : 'sapremo-table--desktop',
  };
}
