import { useEffect } from "react";
import { ConfigProvider, App as AntdApp, theme as antTheme } from "antd";
import AppRouter from "./router/AppRouter";
import { useTranslation } from "react-i18next";
import { useUIStore } from "./store/useUIStore";
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

  return (
    <ConfigProvider
      locale={currentLocale}
      theme={{
        // Включаем динамический алгоритм темы
        algorithm: theme === "dark" ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff", // фирменный яркий голубой цвет
          borderRadius: 6,
          fontFamily: "Inter, sans-serif",
          colorSuccess: "#52c41a",
          colorWarning: "#fa8c16",
          colorError: "#ff4d4f",
          fontSize: 14,
          
          // Глобальное исправление фонов рабочих областей во всех модулях
          colorBgLayout: theme === "dark" ? "#141414" : "#f5f5f5",
          // Тот самый не ослепляющий цвет для подложек, форм и карточек
          colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff", 
          
          // Автоматическая инверсия текста для стопроцентной читаемости
          colorText: theme === "dark" ? "rgba(255, 255, 255, 0.85)" : "#000000",
          colorTextHeading: theme === "dark" ? "#ffffff" : "#1f1f1f",
          colorBorder: theme === "dark" ? "#303030" : "#d9d9d9",
        },
        components: {
          // Настройка "сайдбар"
          Menu: {
            itemBg: "transparent",
            itemSelectedBg: theme === "dark" ? "#111a2c" : "#e6f7ff", // темнее для темной темы
            itemSelectedColor: "#1890ff",
            itemColor: theme === "dark" ? "rgba(255, 255, 255, 0.85)" : "#000000", // адаптивный цвет текста
          },
          // Настройка "таблицы"
          Table: {
            headerBg: theme === "dark" ? "#1f1f1f" : "#fafafa", // адаптивный фон шапки
            headerColor: theme === "dark" ? "rgba(255, 255, 255, 0.85)" : "#000000",
            headerSplitColor: "transparent",
            rowHoverBg: theme === "dark" ? "#262626" : "#f5f5f5",
          },
          // Настройка "вкладки"
          Tabs: {
            inkBarColor: "#1890ff",
            itemActiveColor: "#1890ff",
            itemColor: theme === "dark" ? "rgba(255, 255, 255, 0.65)" : "#000000",
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
            activeBorderColor: "#1890ff",
            hoverBorderColor: "#40a9ff",
            colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
          },
          Select: {
            activeBorderColor: "#1890ff",
            colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
          },
          // Настройка "карточки" (исправляет блоки в Финансовой аналитике)
          Card: {
            colorBgContainer: theme === "dark" ? "#1f1f1f" : "#ffffff",
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