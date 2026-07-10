import "./App.css";
import { ConfigProvider } from "antd";
import AppRouter from "./router/AppRouter"

export default function App() {
    return(
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#1890ff",
                    borderRadius: 6,
                    fontFamily: "Inter, sans-serif",
                    colorSuccess: "#52c41a",
                    colorWarning: "#fa8c16",
                    colorError: "#ff4d4f",
                },
                components: {
                    Menu: {
                        itemBg: "#fffff",
                        itemSelectedBg: "#e6f7ff",
                    },
                },
            }}
        >
            <AppRouter />
        </ConfigProvider>
    );
}