export const exportToExcel = (_data: any[], fileName: string) => {
  try {
    const csvContent = "\uFEFFID,Название,Количество,Статус\n1,Пломбир «Сливочный»,100,Принято\n2,Эскимо в шоколаде,50,Ожидается";
    
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName || 'report'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Ошибка при скачивании тестового файла:", error);
  }
};