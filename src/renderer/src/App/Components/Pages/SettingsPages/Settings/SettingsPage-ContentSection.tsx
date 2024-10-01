import {Card} from 'antd';
import {ReactNode} from 'react';

import {getIconByName, IconNameType} from '../../../../../assets/icons/SvgIconsContainer';

type Props = {
  title: string;
  id?: string;
  icon?: IconNameType;
  children?: ReactNode;
  titleColor?: 'text-warning' | 'text-danger' | string;
  itemsCenter?: boolean;
};

/** Render card for a specif settings */
export default function SettingsSection({children, id, title, titleColor = '', itemsCenter = false, icon}: Props) {
  return (
    <Card
      className={
        `w-full dark:bg-LynxRaisinBlack ${itemsCenter && 'text-center'} scroll-mt-8 ` +
        `border-2 border-foreground/10 dark:border-foreground/5`
      }
      title={
        <div className="flex flex-row items-center justify-center space-x-2">
          {icon && getIconByName(icon, {className: 'size-5'})}
          <span>{title}</span>
        </div>
      }
      id={id}
      bordered={false}
      classNames={{body: 'gap-y-4 !py-2 flex-col flex', title: `text-center ${titleColor}`}}>
      {children}
    </Card>
  );
}
