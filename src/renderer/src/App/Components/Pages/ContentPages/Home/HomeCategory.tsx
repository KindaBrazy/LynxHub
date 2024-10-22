import {motion} from 'framer-motion';
import {ReactNode} from 'react';

import {IconNameType} from '../../../../../assets/icons/SvgIconsContainer';
import CardContainer from '../../CardContainer';

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
      <CardContainer icon={icon} title={title}>
        {children}
      </CardContainer>
    </motion.div>
  );
}
