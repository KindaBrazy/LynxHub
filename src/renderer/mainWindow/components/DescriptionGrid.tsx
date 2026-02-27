import {cn} from '@heroui/react';
import {ReactNode} from 'react';

export type DescriptionGridItem = {
  key: string | number;
  label: ReactNode;
  content: ReactNode;
};

interface DescriptionGridProps {
  title?: ReactNode;
  items: DescriptionGridItem[];
  columns?: 1 | 2;
  className?: string;
}

const columnClass: Record<NonNullable<DescriptionGridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
};

export default function DescriptionGrid({title, items, columns = 2, className}: DescriptionGridProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={cn('rounded-2xl border border-foreground-100 bg-content1/80 px-4 py-4 shadow-xs sm:px-5', className)}>
      {title ? <h4 className="mb-4 text-base font-semibold text-foreground">{title}</h4> : null}
      <div className={cn('grid gap-3', columnClass[columns])}>
        {items.map(item => (
          <div key={item.key} className="min-w-0 rounded-xl bg-foreground-100/70 px-3 py-3 space-y-1">
            <div className="text-xs font-medium tracking-wide text-foreground-700">{item.label}</div>
            <div className="wrap-break-word text-sm font-medium text-foreground-500">{item.content}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
