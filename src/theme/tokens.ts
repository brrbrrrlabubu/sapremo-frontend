/**
 * Design tokens — единственный источник правды для цветов в приложении.
 * Вместо хардкоженных строк типа "#1890ff" или "#141414" используйте эти константы.
 */

export const PALETTE = {
  primary:    '#1890ff',
  primaryHover: '#40a9ff',
  success:    '#52c41a',
  warning:    '#faad14',
  error:      '#ff4d4f',
} as const;

export const DARK = {
  layout:        '#141414',
  container:     '#1f1f1f',
  elevated:      '#262626',
  sidebar:       '#111a2c',
  sidebarNav:    '#001529',
  border:        '#303030',
  borderLight:   '#f0f0f0',
  text:          'rgba(255, 255, 255, 0.85)',
  textSecondary: 'rgba(255, 255, 255, 0.65)',
  textTertiary:  'rgba(255, 255, 255, 0.45)',
  // Stat card backgrounds
  bgPrimary:     '#111a2c',
  bgSuccess:     '#142518',
  bgWarning:     '#2b2111',
  bgError:       '#2c1517',
  // Stat card borders
  borderPrimary: '#152542',
  borderSuccess: '#1b3d22',
  borderWarning: '#4d3e1f',
  borderError:   '#4a1e22',
} as const;

export const LIGHT = {
  layout:        '#f5f5f5',
  container:     '#ffffff',
  elevated:      '#fafafa',
  sidebar:       '#e6f7ff',
  sidebarNav:    '#ffffff',
  border:        '#d9d9d9',
  borderLight:   '#f0f0f0',
  text:          '#000000',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textTertiary:  'rgba(0, 0, 0, 0.45)',
  // Stat card backgrounds
  bgPrimary:     '#f0f9ff',
  bgSuccess:     '#f6ffed',
  bgWarning:     '#fffbe6',
  bgError:       '#fff2f0',
  // Stat card borders
  borderPrimary: '#bae7ff',
  borderSuccess: '#b7eb8f',
  borderWarning: '#ffe58f',
  borderError:   '#ffa39e',
} as const;

/** Возвращает набор цветов для текущей темы */
export const themed = (isDark: boolean) => isDark ? DARK : LIGHT;
