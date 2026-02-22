import { Card, CardBody, CardHeader } from '@heroui/react';
import { ContainersBg } from '@lynx/utils/commonStyles';
import { ReactNode } from 'react';

/** Props for the CardsContainer component. */
export interface CardsContainerProps {
  /** The content to be rendered inside the container body. */
  children?: ReactNode;
  /** The icon to display in the header. */
  icon: ReactNode;
  /** The main title of the container. */
  title: string;
  /** Optional subtitle displayed below the title. */
  subTitle?: string;
  /** Optional custom class names for the root card element. */
  extraClassNames?: string;
}

export const CardContainerClasses = 'size-6 mr-2 hover:transition hover:duration-500 hover:opacity-80';

/**
 * A standardized container component for grouping cards on the home page.
 * Includes a header with an icon, title, and subtitle, and a body for the content.
 */
export default function CardsContainer({ children, icon, title, subTitle, extraClassNames }: CardsContainerProps) {
  return (
    <Card className={[ContainersBg, extraClassNames].filter(Boolean).join(' ')}>
      <CardHeader className="flex-col items-start px-6 pt-5">
        <div className="flex flex-row items-center">
          {icon}
          <span className="text-lg font-bold hover:transition hover:duration-500 hover:opacity-80">{title}</span>
        </div>
        <span className="text-small text-foreground-500">{subTitle}</span>
      </CardHeader>
      <CardBody className="overflow-hidden px-6 pb-6 scrollbar-hide">{children}</CardBody>
    </Card>
  );
}
