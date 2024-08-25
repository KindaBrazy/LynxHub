import {motion} from 'framer-motion';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  id?: string;
  className?: string;
};

// App page with a fade in animation
export default function Page({children, id, className}: Props) {
  return (
    <motion.div
      id={id}
      transition={{duration: 0.35}}
      initial={{filter: 'blur(3px)', opacity: 0}}
      animate={{filter: 'blur(0px)', opacity: 1}}
      className={['size-full py-2.5', className].join(' ')}>
      {children}
    </motion.div>
  );
}
