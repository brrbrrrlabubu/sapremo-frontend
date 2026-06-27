<<<<<<< HEAD
import { useUserStore } from './store/useUserStore'

function App() {
  const { user, setUser, clearUser } = useUserStore()

  return (
      <div>
        <p>Пользователь: {user ? user.name : 'не выбран'}</p>
        <button onClick={() => setUser({ id: '1', name: 'Алёна', role: 'admin' })}>
          Войти как админ
        </button>
        <button onClick={clearUser}>Выйти</button>
      </div>
  )
}

export default App
=======

import "./App.css";
import { ConfigProvider } from "antd";
import AppRouter from "./router/AppRouter"

export default function App() {
  return(
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
          itemBg: "#fffff",
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
>>>>>>> 05f595a642692ed936fc7cb3f566484a0905ccec
