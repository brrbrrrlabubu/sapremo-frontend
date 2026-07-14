import { useEffect } from "react";
import { ConfigProvider, App as AntdApp, theme as antTheme } from "antd";
import AppRouter from "./router/AppRouter";
import { useTranslation } from "react-i18next";
import { useUIStore } from "./store/useUIStore";
import { PALETTE, themed } from "./theme/tokens";
import "./i18n"; // Инициализируем локализацию

// Импортируем языковые пакеты Ant Design
import ruRU from "antd/locale/ru_RU";
import enUS from "antd/locale/en_US";

export default function App() {
  const { theme, lang } = useUIStore();
  const { i18n } = useTranslation();

  // Синхронизируем язык при его изменении в сторе
  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  // Выбираем локаль для компонентов Ant Design
  const currentLocale = lang === "ru" ? ruRU : enUS;
  const tTheme = themed(theme === "dark");

  return (
    <ConfigProvider
      locale={currentLocale}
      theme={{
        // Включаем динамический алгоритм темы
        algorithm: theme === "dark" ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: PALETTE.primary, // фирменный яркий голубой цвет
          borderRadius: 6,
          fontFamily: "Inter, sans-serif",
          colorSuccess: PALETTE.success,
          colorWarning: PALETTE.warning,
          colorError: PALETTE.error,
          fontSize: 14,
          
          // Глобальное исправление фонов рабочих областей во всех модулях
          colorBgLayout: tTheme.layout,
          // Тот самый не ослепляющий цвет для подложек, форм и карточек
          colorBgContainer: tTheme.container, 
          
          // Автоматическая инверсия текста для стопроцентной читаемости
          colorText: tTheme.text,
          colorTextHeading: tTheme.text,
          colorBorder: tTheme.border,
        },
        components: {
          // Настройка "сайдбар"
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: tTheme.sidebar, // темнее для темной темы
            itemSelectedColor: PALETTE.primary,
            itemColor: tTheme.text, // адаптивный цвет текста
          },
          // Настройка "таблицы"
          Table: {
            headerBg: tTheme.container, // адаптивный фон шапки
            headerColor: tTheme.text,
            headerSplitColor: "transparent",
            rowHoverBg: tTheme.elevated,
          },
          // Настройка "вкладки"
          Tabs: {
            inkBarColor: PALETTE.primary,
            itemActiveColor: PALETTE.primary,
            itemColor: tTheme.textSecondary,
            horizontalMargin: "0 0 16px 0",
          },
          // Настройка "модальное окно"
          Modal: {
            headerBg: "transparent",
            paddingLG: 24,
          },
          // Настройка "переключатель" (Switch)
          Switch: {
            handleBg: "#ffffff",
          },
          // Настройка "поля ввода" (Input) и "Селекты"
          Input: {
            activeBorderColor: PALETTE.primary,
            hoverBorderColor: PALETTE.primaryHover,
            colorBgContainer: tTheme.container,
          },
          Select: {
            activeBorderColor: PALETTE.primary,
            colorBgContainer: tTheme.container,
          },
          // Настройка "карточки" (исправляет блоки в Финансовой аналитике)
          Card: {
            colorBgContainer: tTheme.container,
          },
        },
      }}
    >
      <AntdApp>
        <AppRouter />
      </AntdApp>
    </ConfigProvider>
  );
}