import {motion} from 'framer-motion';
import {ReactNode} from 'react';

import CardContainer from '../../CardContainer';

type Props = {
  children: ReactNode;
  icon: ReactNode;
  title: string;
  subTitle?: string;
};

export default function HomeCategory({children, subTitle, icon, title}: Props) {
  return (
    <motion.div
      transition={{duration: 0.2}}
      className="flex w-full flex-col p-4 py-0"
      animate={{opacity: 1, scale: 1, translateY: 0}}
      initial={{opacity: 0, scale: 0.95, translateY: 5}}
      layout>
      <CardContainer icon={icon} title={title} subTitle={subTitle}>
        {children}
      </CardContainer>
    </motion.div>
  );
}
