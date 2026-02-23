import {Card, CardBody, cn} from '@heroui/react';
import {ReactNode} from 'react';

type Props = {
  className?: string;
  bodyClassName?: string;
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
};

/**
 * Reusable empty-state container with consistent HeroUI card styling.
 */
export default function EmptyStateCard({className, bodyClassName, icon, title, description, action, children}: Props) {
  return (
    <Card className={cn('border border-foreground-200/70 bg-foreground-50/50 shadow-none', className)}>
      <CardBody className={cn('flex items-center justify-center gap-y-2 px-6 py-10 text-center', bodyClassName)}>
        {icon}
        {typeof title === 'string' ? <h3 className="text-base font-medium text-foreground-600">{title}</h3> : title}
        {typeof description === 'string' ? <p className="text-sm text-foreground-500">{description}</p> : description}
        {action}
        {children}
      </CardBody>
    </Card>
  );
}
