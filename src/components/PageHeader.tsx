import { Card, Typography } from "antd";

const { Title } = Typography;

export default function PageHeader({ title }: { title: string }) {
  return (
    <Card style={{ marginBottom: 24, borderRadius: 8 }}>
      <Title level={3} style={{ margin: 0 }}>{title}</Title>
    </Card>
  );
}