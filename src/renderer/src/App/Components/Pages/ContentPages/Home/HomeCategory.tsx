import {Card} from 'antd';
import {motion} from 'framer-motion';
import {ReactNode} from 'react';

import {getIconByName, IconNameType} from '../../../../../assets/icons/SvgIconsContainer';

type Props = {
  children: ReactNode;
  icon: IconNameType;
  title: string;
};

export default function HomeCategory({children, icon, title}: Props) {
  return (
    <motion.div
      transition={{duration: 0.2}}
      exit={{opacity: 0, scale: 0.95}}
      animate={{opacity: 1, scale: 1}}
      initial={{opacity: 0, scale: 0.95}}
      className="flex w-full flex-col p-4 py-0"
      layout>
      <Card
        title={
          <div className="flex w-full flex-row items-center justify-between overflow-visible">
            {getIconByName(icon, {className: 'size-6 mr-2 hover:transition hover:duration-500 hover:opacity-80'})}
            <span className="text-lg font-bold hover:opacity-80 hover:transition hover:duration-500">{title}</span>
            <div />
          </div>
        }
        bordered={false}
        className="bg-white/80 dark:bg-LynxRaisinBlack/80">
        {children}
      </Card>
    </motion.div>
  );
}
