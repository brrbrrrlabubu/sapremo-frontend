import { ConfigProvider } from "antd";
import AppRouter from "./router/AppRouter";

// Проверь, чтобы было именно ТАК в начале функции:
export default function App() {
  return (
// Вставляй этот ConfigProvider в самое начало рендера твоего приложения:
<ConfigProvider
  theme={{
    token: {
      
      colorPrimary: "#1890ff", // фирменный яркий голубой цвет для кнопок, фокусов и активных элементов
      borderRadius: 4, // Радиус скругления 
      fontSize: 14, // Базовый шрифт интерфейса
    },
    components: {
      //  Настройка "сайдбар"
      Menu: {
        itemBg: "transparent",
        itemSelectedBg: "#e6f7ff", // нежно-голубой фон для активного пункта "Дашборд"
        itemSelectedColor: "#1890ff", // цвет текста "Дашборд"
        itemColor: "#000000", // обычный черный текст для остальных пунктов
      },
      // Настройка "таблицы"
      Table: {
        headerBg: "#fafafa", // чистый светлый фон для шапки (Name, Age, Address)
        headerColor: "#000000", // черный цвет текста в шапке
        headerSplitColor: "transparent", // убираем разделительные палочки между колонками
        rowHoverBg: "#f5f5f5", // легкий серый фон при наведении на строку
      },
      // Настройка "вкладки"
      Tabs: {
        inkBarColor: "#1890ff", // та самая яркая голубая полоска под активным табом
        itemActiveColor: "#1890ff", // цвет текста активной вкладки
        itemColor: "#000000", // остальные вкладки просто черные
        horizontalMargin: "0 0 16px 0",
      },
      // Настройка "модальное окно"
      Modal: {
        headerBg: "transparent",
        paddingLG: 24,
      },
      // 5. Настройка для СКРИНШОТА "переключатель" (Switch)
      Switch: {
        handleBg: "#ffffff", // белый круглый ползунок
      },
      // 6. Настройка для СКРИНШОТА "поля ввода" (Input) и "Селекты"
      Input: {
        activeBorderColor: "#1890ff", // голубая рамка при фокусе (как на скрине example|)
        hoverBorderColor: "#40a9ff",
      },
      Select: {
        activeBorderColor: "#1890ff", // голубая рамка при открытом селекте (как у Lucy)
      }
    },
  }}
>
  {/* Тут идет твой Layout и роутер */}
  <AppRouter /> 
</ConfigProvider>
  );
}