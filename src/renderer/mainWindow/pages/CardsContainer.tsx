import {Card, Description, Label} from '@heroui-v3/react';
import {ReactNode} from 'react';

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
export default function CardsContainer({children, icon, title, subTitle, extraClassNames}: CardsContainerProps) {
  return (
    <Card variant="secondary" className={[extraClassNames].filter(Boolean).join(' ')}>
      <Card.Header>
        <div className="flex flex-row items-center">
          {icon}
          <Label className="text-lg font-bold">{title}</Label>
        </div>
        <Description className="text-sm">{subTitle}</Description>
      </Card.Header>
      <Card.Content className="overflow-hidden scrollbar-hide">{children}</Card.Content>
    </Card>
  );
}
