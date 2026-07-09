import { Tag } from "antd";
import dayjs from "dayjs";

export const getInventoryColumns = () => [
  { title: 'Наименование', dataIndex: 'name', key: 'name' },
  { title: 'Цена', dataIndex: 'price', key: 'price', render: (p: number) => `${p} сом` },
  { title: 'Кол-во', dataIndex: 'quantity', key: 'quantity' },
  { title: 'В коробке', dataIndex: 'inBox', key: 'inBox' },
  { 
    title: 'Срок годности', 
    dataIndex: 'expiryDate', 
    key: 'expiryDate',
    render: (date: string) => {
      // Если до срока меньше 30 дней - подсвечиваем красным (volcano)
      const isExpiring = dayjs(date).diff(dayjs(), 'day') < 30;
      return <Tag color={isExpiring ? "volcano" : "green"}>{date}</Tag>;
    }
  },
];