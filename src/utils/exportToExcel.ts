import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string = 'report') => {
  try {
    if (!data || data.length === 0) {
      console.warn('Нет данных для экспорта');
      return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчет');

    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (error) {
    console.error("Ошибка при экспорте в Excel:", error);
  }
};