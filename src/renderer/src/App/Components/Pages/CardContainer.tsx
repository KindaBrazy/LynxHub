import {Card, CardBody, CardHeader} from '@heroui/react';
import {ReactNode} from 'react';

type Props = {
  children?: ReactNode;
  icon: ReactNode;
  title: string;
  subTitle?: string;
  extraClassNames?: string;
};

export const CardContainerClasses = 'size-6 mr-2 hover:transition hover:duration-500 hover:opacity-80';

export default function CardContainer({children, icon, title, subTitle, extraClassNames}: Props) {
  return (
    <Card className={['bg-white/20 dark:bg-black/20', extraClassNames].join(' ')}>
      <CardHeader className="flex-col items-start px-6 pt-5">
        <div className="flex flex-row items-center">
          {icon}
          <span className="text-lg font-bold hover:opacity-80 hover:transition hover:duration-500">{title}</span>
        </div>
        <span className="text-small text-foreground-500">{subTitle}</span>
      </CardHeader>
      <CardBody className="overflow-hidden scrollbar-hide pb-6 px-6">{children}</CardBody>
    </Card>
  );
}
