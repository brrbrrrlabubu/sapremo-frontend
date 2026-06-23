import axios from 'axios';

//Общий экземпляр для будущих запросов

const axiosClient = axios.create({

    //Сюда потом встами реальный URL бэкенда, пока стоит заглушка
    
    baseURL: 'https://api.sapremo.com/v1', 
    timeout: 10000, // Если сервер не отвечает 10 секунд - отменяем запрос 
    headers: {
        'Content-Type': 'application/json',
    },
});
// Перехватчик Направляемых запросов 

axiosClient.interceptors.request.use(
    (config) => {
        // ВРЕМЕННАЯ ЗАГЛУШКА 
        const token = localStorage.getItem("token") || "temporary_mock_token";

        if (token && config.headers) {
            // Автоматически добавляем токен в каждый запрос для авторизации
            config.headers.Authorization = `Bearer &{token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// Перехватчик Входящих ответов (Response Interceptor)
// Он ловит ответы от сервера до того, как они попадут в компоненты
axiosClient.interceptors.response.use(
    (response) => response, 
    (error) => {
        // Если сервер ответил 401 (Токен просрочен или неверный)
        if (error.response && error.response.status === 401) {
            console.warn("Сессия устарела. Перенаправление на логин...");
            // Здесь будет логика очистки хранилища и редиректа, когда Нурсултан закончит стейт
            localStorage.removeItem("token");
            window.location.href = "./login";
        }

        return Promise.reject(error);
    }
);


export default axiosClient;