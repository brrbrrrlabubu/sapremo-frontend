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