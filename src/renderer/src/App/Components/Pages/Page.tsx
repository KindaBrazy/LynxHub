import {motion, Variants} from 'framer-motion';
import {ReactNode, useEffect, useState} from 'react';

const pageTransitionVariants: Variants = {
  enter: {opacity: 1},
  exit: {opacity: 0},
};

type Props = {
  children: ReactNode;
  className?: string;
  show?: boolean;
};

export default function Page({children, className, show}: Props) {
  const [showClassName, setShowClassName] = useState<string>('');

  useEffect(() => {
    if (show) {
      setShowClassName('block');
    } else {
      setTimeout(() => {
        setShowClassName('hidden');
      }, 200);
    }
  }, [show]);

  return (
    <motion.div
      initial="exit"
      variants={pageTransitionVariants}
      animate={show ? 'enter' : 'exit'}
      transition={{duration: 0.2, ease: [0.25, 0.1, 0.25, 1]}}
      className={[`size-full py-2.5 ${showClassName}`, className].join(' ')}>
      {children}
    </motion.div>
  );
}
