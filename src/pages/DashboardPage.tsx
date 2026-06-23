import { useState } from "react";
{/* import { Button } from "antd"; */}

export default function DashboardPage() {
  const [isOpen, setIsOpen] = 
  useState<boolean>(false);
  

  return(
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              {/* <Button type="primary">Тестовая кнопка</Button> */}
                      <h3 style={{ color: "#1890ff", fontSize: "24px"}}>📊Главная панель SAPREMO</h3>
                    <p style={{ fontSize: '16px', color: '#595959'}}>
                     Система управления заводом успешно запущена в локальной среде разработки Vite</p>
                     
                     <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px', display: 'inline-block'}}>
                      <p>💡 <strong> Статус разработки (Спринт 1):</strong> Базовый каркас и роутинг вкладок готовы.</p>
                     </div>
                     <div style={{ marginTop: "50px" }}>
                        <button className="open-btn" onClick={() => setIsOpen(true)}>📞 Связаться с командой разработки</button>
                     </div>
                     {isOpen && (
                       <div className="modal-overlay">
                         <div className="modal-content">
                            <h3>Контакты 3-й команды</h3>
                            <p>Телефон +996 XXX XX XX</p>
                            <p>Тимлид: Айсулуу</p>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>Закрыть</button>
                        </div>
                    </div>
              )}
            </div>  
  );
}