import React from 'react';
import { Card, Tag } from 'antd';

// ─── Типы ────────────────────────────────────────────────────────────────────
export interface MobileCardField {
  label: string;
  value: React.ReactNode;
  /** Если true — значение выводится как основной заголовок карточки */
  isPrimary?: boolean;
  /** Если передан — выводится TagColor вместо текста */
  tagColor?: string;
}

interface MobileCardProps {
  fields: MobileCardField[];
  actions?: React.ReactNode;
  /** Дополнительный style для карточки */
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * Универсальная карточка для мобильного отображения таблиц.
 *
 * Использование:
 * <MobileCard
 *   fields={[
 *     { label: 'Дата', value: '20.06.2026' },
 *     { label: 'Сумма', value: '+1 500 сом', isPrimary: true },
 *     { label: 'Статус', value: 'Отгружена', tagColor: 'success' },
 *   ]}
 *   actions={<Button size="small">Просмотр</Button>}
 * />
 */
export const MobileCard: React.FC<MobileCardProps> = ({
  fields,
  actions,
  style,
  onClick,
}) => {
  const primaryField = fields.find((f) => f.isPrimary);
  const otherFields = fields.filter((f) => !f.isPrimary);

  return (
    <Card
      size="small"
      style={{
        borderRadius: 8,
        marginBottom: 8,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        ...style,
      }}
      onClick={onClick}
      styles={{ body: { padding: '12px 16px' } }}
    >
      {/* Шапка карточки с основным полем */}
      {primaryField && (
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 10,
            color: 'var(--color-text, rgba(0,0,0,0.88))',
          }}
        >
          {primaryField.tagColor ? (
            <Tag color={primaryField.tagColor}>{primaryField.value}</Tag>
          ) : (
            primaryField.value
          )}
        </div>
      )}

      {/* Список полей */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {otherFields.map((field, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: 'var(--color-text-secondary, #8c8c8c)',
                flexShrink: 0,
                minWidth: 80,
              }}
            >
              {field.label}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                textAlign: 'right',
                color: 'var(--color-text, rgba(0,0,0,0.88))',
              }}
            >
              {field.tagColor ? (
                <Tag color={field.tagColor} style={{ margin: 0 }}>
                  {field.value}
                </Tag>
              ) : (
                field.value
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Экшны внизу карточки */}
      {actions && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid var(--color-border, #f0f0f0)',
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </Card>
  );
};

// ─── Список карточек ──────────────────────────────────────────────────────────
interface MobileCardListProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  emptyText?: string;
}

export function MobileCardList<T>({
  data,
  renderCard,
  loading,
  emptyText = 'Нет данных',
}: MobileCardListProps<T>) {
  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 100,
              background: '#f5f5f5',
              borderRadius: 8,
              marginBottom: 8,
              animation: 'pulse 1.5s infinite',
            }}
          />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: 'var(--color-text-secondary, #8c8c8c)',
        }}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 16px' }}>
      {data.map((item, index) => renderCard(item, index))}
    </div>
  );
}
