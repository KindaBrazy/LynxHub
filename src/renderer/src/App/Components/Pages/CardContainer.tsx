import {getIconByName, IconNameType} from '@renderer/assets/icons/SvgIconsContainer';
import {Card} from 'antd';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  icon: IconNameType;
  title: string;
  extraClassNames?: string;
};

export default function CardContainer({children, icon, title, extraClassNames}: Props) {
  return (
    <Card
      className={['border-2 border-foreground/5 bg-white !shadow-medium dark:bg-LynxRaisinBlack', extraClassNames].join(
        ' ',
      )}
      title={
        <div className="flex w-full flex-row items-center justify-between overflow-visible">
          {getIconByName(icon, {className: 'size-5 mr-2 hover:transition hover:duration-500 hover:opacity-80'})}
          <span className="text-lg font-bold hover:opacity-80 hover:transition hover:duration-500">{title}</span>
          <div />
        </div>
      }
      bordered={false}>
      {children}
    </Card>
  );
}
