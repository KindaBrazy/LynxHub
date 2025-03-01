import {motion} from 'framer-motion';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  show?: boolean;
};

// App page with a fade in animation
export default function Page({children, className}: Props) {
  return (
    <motion.div
      className={['size-full py-2.5', className].join(' ')}
      transition={{duration: 0.3, ease: [0.25, 0.1, 0.25, 1]}}
      animate={{filter: 'blur(0px)', opacity: 1, transform: 'translateY(0%)'}}
      initial={{filter: 'blur(3px)', opacity: 0, transform: 'translateY(-2%)'}}>
      {children}
    </motion.div>
  );
}
