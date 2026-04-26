import {cn} from '@heroui-v3/react';
import {ReactNode} from 'react';

export type DescriptionGridItem = {
  key: string | number;
  label: ReactNode;
  content: ReactNode;
};

interface DescriptionGridProps {
  title?: ReactNode;
  items: DescriptionGridItem[];
  columns?: 1 | 2 | 3;
  className?: string;
  itemClassName?: string;
}

const columnClass: Record<NonNullable<DescriptionGridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-3',
};

export default function DescriptionGrid({title, items, columns = 2, className, itemClassName}: DescriptionGridProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        'rounded-3xl border border-surface-secondary bg-surface-secondary/80 px-4 py-4 shadow-xs sm:px-5',
        className,
      )}>
      {title ? <h4 className="mb-4 text-base font-semibold text-foreground">{title}</h4> : null}
      <div className={cn('grid gap-3', columnClass[columns])}>
        {items.map(item => (
          <div
            key={item.key}
            className={cn('min-w-0 rounded-3xl bg-surface/70 dark:bg-surface/70 px-3 py-3 space-y-1', itemClassName)}>
            <div className="text-xs font-medium tracking-wide text-foreground-700">{item.label}</div>
            <div className="wrap-break-word text-sm font-medium text-foreground-500">{item.content}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
