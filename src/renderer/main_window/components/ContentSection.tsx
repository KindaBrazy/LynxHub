import {Card, CardBody, CardHeader} from '@heroui/react';
import SettingsSearchHighlight from '@lynx/pages/settings/SettingsSearchHighlight';
import {useRegisterSectionSearch} from '@lynx/pages/settings/SettingsSearchRegistry';
import {ContainersBg} from '@lynx/utils/common_styles';
import {motion} from 'framer-motion';
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
  useRegisterSectionSearch(id, title);

  return (
    <motion.div
      transition={{duration: 0.2}}
      animate={{translateX: 0, opacity: 1}}
      initial={{translateX: -50, opacity: 0}}>
      <Card id={id} shadow="sm" className={`w-full ${ContainersBg} border-1 border-foreground-100`}>
        <CardHeader className={`flex flex-row items-center justify-center gap-x-2 ${titleColor}`}>
          {icon}
          <SettingsSearchHighlight text={title} />
        </CardHeader>
        <CardBody className={`${itemsCenter && 'justify-center'} flex flex-col gap-y-3`}>{children}</CardBody>
      </Card>
    </motion.div>
  );
}
