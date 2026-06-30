import "./App.css";
import { ConfigProvider } from "antd";
import AppRouter from "./router/AppRouter";

// Проверь, чтобы было именно ТАК в начале функции:
export default function App() {
  return (
    <ConfigProvider
      theme={{
        //Здесь мы настраиваем глобальные цвета системы
        token: {
          colorPrimary: "#1890ff", //Основной цвет(кнопки, активные элементы)
          borderRadius: 6, // Скругление углов у всех компонентов AntD
          fontFamily: "Inter, sans-serif", // Глобальный шрифт
          colorSuccess: "#52c41a", //Успех, "Доставлено", "В наличии" (зеленый)
          colorWarning: "#fa8c16", //Предупреждение, "В пути", "Ожидает"(оранжевый)
          colorError: "#ff4d4f", // Ошибка, "Отменено" , "Дефицит"(красный)
        },
        //А здесь можно точечно настраивать отдельные компоненты, например Сайдбар или Меню
        components: {
          Menu: {
            itemBg: "#ffffff",
            itemSelectedBg: "#e6f7ff",
          },
        },
      }}
    >
      {/* Запускаем наш движок маршрутов */}
      <AppRouter />
    </ConfigProvider>
  );
}