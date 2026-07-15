/**
 * Design tokens — единственный источник правды для цветов в приложении.
 * Используются мягкие премиальные цвета, чтобы избежать нагрузки на глаза (WCAG AA).
 */

export const PALETTE = {
  primary:    '#3b82f6', // Slightly desaturated blue
  primaryHover: '#60a5fa',
  success:    '#10b981', // Soft green
  warning:    '#f59e0b', // Soft amber
  error:      '#ef4444', // Soft red
} as const;

export const DARK = {
  layout:        '#0b0f19', // Soft deep slate
  container:     '#1e293b', // Elevated slate
  elevated:      '#334155', // Lighter slate for popups
  sidebar:       '#0f172a',
  sidebarNav:    '#0b0f19',
  border:        '#334155', // Muted border
  borderLight:   '#475569',
  text:          '#f8fafc', // Off-white
  textSecondary: '#94a3b8', // Muted gray
  textTertiary:  '#64748b',
  
  // Stat card backgrounds (subtle tints on slate)
  bgPrimary:     '#0f172a',
  bgSuccess:     'rgba(16, 185, 129, 0.1)',
  bgWarning:     'rgba(245, 158, 11, 0.1)',
  bgError:       'rgba(239, 68, 68, 0.1)',
  
  // Stat card borders
  borderPrimary: '#1e293b',
  borderSuccess: 'rgba(16, 185, 129, 0.2)',
  borderWarning: 'rgba(245, 158, 11, 0.2)',
  borderError:   'rgba(239, 68, 68, 0.2)',
} as const;

export const LIGHT = {
  layout:        '#f8fafc', // Soft light gray
  container:     '#ffffff',
  elevated:      '#ffffff',
  sidebar:       '#f1f5f9',
  sidebarNav:    '#ffffff',
  border:        '#e2e8f0',
  borderLight:   '#f1f5f9',
  text:          '#0f172a', // Dark slate instead of pure black
  textSecondary: '#475569',
  textTertiary:  '#94a3b8',
  
  // Stat card backgrounds
  bgPrimary:     '#eff6ff',
  bgSuccess:     '#ecfdf5',
  bgWarning:     '#fffbeb',
  bgError:       '#fef2f2',
  
  // Stat card borders
  borderPrimary: '#bfdbfe',
  borderSuccess: '#a7f3d0',
  borderWarning: '#fde68a',
  borderError:   '#fecaca',
} as const;

/** Возвращает набор цветов для текущей темы */
export const themed = (isDark: boolean) => isDark ? DARK : LIGHT;
