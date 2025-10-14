import {Card, CardBody, CardHeader} from '@heroui/react';
import {ReactNode} from 'react';

import {ContainersBg} from '../../../../Utils/CrossStyle';

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
    <Card id={id} className={`w-full ${ContainersBg} border-1 border-foreground-100`}>
      <CardHeader className={`flex flex-row items-center justify-center gap-x-2 ${titleColor}`}>
        {icon}
        {title}
      </CardHeader>
      <CardBody className={`${itemsCenter && 'justify-center'} flex flex-col gap-y-3`}>{children}</CardBody>
    </Card>
  );
}
