import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (title: string, columns: any[], data: any[]) => {
  const doc = new jsPDF();

  // Вместо загрузки по сети - используем стандартный шрифт для цифр и латиницы,
  // А для кириллицы - попробуем встроенную поддержку (jsPDF v2+ умеет UTF-8)
  doc.setFontSize(18);
  doc.text(title, 14, 15);

  autoTable(doc, {
    head: [columns.map(c => c.title)],
    body: data.map(item => columns.map(c => String(item[c.dataIndex] || ''))),
    startY: 25,
    // ВАЖНО: убираем принудительный Roboto, если он не грузится
    // В современных версиях jsPDF кириллица может работать сама
  });

  doc.save(`${title}.pdf`);
};