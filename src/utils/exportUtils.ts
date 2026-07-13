import * as XLSX from 'xlsx';
export const exportToExcel = (data: any[], fileName: string) => {
  // Используем приведение к типу 'any', чтобы отключить проверку типов для этой библиотеки
  const workbook = (XLSX as any).utils.book_new();
  const worksheet = (XLSX as any).utils.json_to_sheet(data);
  (XLSX as any).utils.book_append_sheet(workbook, worksheet, "Sheet1");
  (XLSX as any).writeFile(workbook, `${fileName}.xlsx`);
};