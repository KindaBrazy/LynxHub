import {Card} from 'antd';
import {ReactNode} from 'react';

import {getIconByName, IconNameType} from '../../../assets/icons/SvgIconsContainer';

type Props = {
  children?: ReactNode;
  icon: IconNameType;
  title: string;
  subTitle?: string;
  extraClassNames?: string;
};

export default function CardContainer({children, icon, title, subTitle, extraClassNames}: Props) {
  return (
    <Card
      title={
        <div className="flex w-full flex-col overflow-visible py-2">
          <div className="flex flex-row items-center">
            {getIconByName(icon, {className: 'size-6 mr-2 hover:transition hover:duration-500 hover:opacity-80'})}
            <span className="text-lg font-bold hover:opacity-80 hover:transition hover:duration-500">{title}</span>
          </div>
          <span className="text-small text-foreground-500">{subTitle}</span>
        </div>
      }
      bordered={false}
      className={['border-2 border-foreground/5 bg-white !shadow-medium dark:bg-[#292929]', extraClassNames].join(' ')}>
      {children}
    </Card>
  );
}
