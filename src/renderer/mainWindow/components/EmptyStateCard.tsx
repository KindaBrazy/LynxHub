import {Card, CardProps, cn} from '@heroui/react';
import {ReactNode} from 'react';

type Props = {
  className?: string;
  bodyClassName?: string;
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  variant?: CardProps['variant'];
};

/**
 * Reusable empty-state container with consistent HeroUI card styling.
 */
export default function EmptyStateCard({
  className,
  bodyClassName,
  icon,
  title,
  description,
  action,
  children,
  variant,
}: Props) {
  return (
    <Card variant={variant} className={cn('border border-surface-secondary/70 p-0', className)}>
      <Card.Content className={cn('flex items-center justify-center gap-y-2 px-6 py-10 text-center', bodyClassName)}>
        {icon}
        {typeof title === 'string' ? <h3 className="text-base font-medium text-semi-muted">{title}</h3> : title}
        {typeof description === 'string' ? <p className="text-sm text-muted">{description}</p> : description}
        {action}
        {children}
      </Card.Content>
    </Card>
  );
}
