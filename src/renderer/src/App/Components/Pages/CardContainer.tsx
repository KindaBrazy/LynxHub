import {Card} from 'antd';
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
    <Card
      title={
        <div className="flex w-full flex-col overflow-visible py-2">
          <div className="flex flex-row items-center">
            {icon}
            <span className="text-lg font-bold hover:opacity-80 hover:transition hover:duration-500">{title}</span>
          </div>
          <span className="text-small text-foreground-500">{subTitle}</span>
        </div>
      }
      type="inner"
      variant="borderless"
      className={[' bg-white !shadow-medium dark:bg-LynxRaisinBlack rounded-2xl', extraClassNames].join(' ')}>
      {children}
    </Card>
  );
}
