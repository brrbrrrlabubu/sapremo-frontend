import { Button, Select } from 'antd';
import { useUIStore } from '../store/useUIStore';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ThemeLangSelectorProps {
  compact?: boolean;
}

export const ThemeLangSelector: React.FC<ThemeLangSelectorProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const { theme, lang, toggleTheme, setLang } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '6px' : '12px', flexShrink: 0 }}>
      {/* Переключатель темы — только иконка на мобильных */}
      <Button 
        onClick={toggleTheme} 
        icon={isDark ? <BulbFilled style={{ color: '#faad14' }} /> : <BulbOutlined />}
        size={compact ? "small" : "middle"}
      >
        {!compact && (isDark ? t('common.darkTheme') : t('common.lightTheme'))}
      </Button>

      {/* Выбор языка */}
      <Select
        value={lang}
        onChange={(value) => setLang(value as 'ru' | 'en')}
        style={{ width: compact ? 62 : 75 }}
        size={compact ? "small" : "middle"}
        options={[
          { value: 'ru', label: 'RU' },
          { value: 'en', label: 'EN' },
        ]}
      />
    </div>
  );
};