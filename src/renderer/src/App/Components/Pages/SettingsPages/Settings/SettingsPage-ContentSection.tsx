import {Card} from 'antd';
import {ReactNode} from 'react';

type Props = {
  title: string;
  id?: string;
  icon?: ReactNode;
  children?: ReactNode;
  titleColor?: 'text-warning' | 'text-danger' | string;
  itemsCenter?: boolean;
};

/** Render card for a specif settings */
export default function SettingsSection({children, id, title, titleColor = '', itemsCenter = false, icon}: Props) {
  return (
    <Card
      title={
        <div className="flex flex-row items-center justify-center space-x-2">
          {icon}
          <span>{title}</span>
        </div>
      }
      className={
        `w-full dark:bg-LynxRaisinBlack ${itemsCenter && 'text-center'} scroll-mt-8 ` +
        `border-2 border-foreground/10 dark:border-foreground/5`
      }
      id={id}
      bordered={false}
      classNames={{body: 'gap-y-4 !py-2 flex-col flex', title: `text-center ${titleColor}`}}>
      {children}
    </Card>
  );
}
