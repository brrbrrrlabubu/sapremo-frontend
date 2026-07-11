import React from 'react';
import { useUIStore } from '../store/useUIStore';

export const ThemeLangSelector: React.FC = () => {
  const { theme, lang, toggleTheme, setLang } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Чистая кнопка переключения темы без Ant Design и иконок */}
      <button
        onClick={toggleTheme}
        style={{
          background: isDark ? '#2b2b2b' : '#f5f5f5',
          color: isDark ? '#ffffff' : '#000000',
          border: `1px solid ${isDark ? '#434343' : '#d9d9d9'}`,
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          transition: 'all 0.3s',
          outline: 'none'
        }}
      >
        {isDark ? 'Тёмная тема' : 'Светлая тема'}
      </button>

      {/* Чистый нативный селект для выбора языка */}
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        style={{
          background: isDark ? '#2b2b2b' : '#ffffff',
          color: isDark ? '#ffffff' : '#000000',
          border: `1px solid ${isDark ? '#434343' : '#d9d9d9'}`,
          padding: '5px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          outline: 'none',
          transition: 'all 0.3s'
        }}
      >
        <option value="ru" style={{ background: isDark ? '#2b2b2b' : '#ffffff' }}>RU</option>
        <option value="en" style={{ background: isDark ? '#2b2b2b' : '#ffffff' }}>EN</option>
      </select>
    </div>
  );
};