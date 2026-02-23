import {motion, Variants} from 'framer-motion';
import {ReactNode, useState} from 'react';

const pageTransitionVariants: Variants = {
  enter: {opacity: 1},
  exit: {opacity: 0},
};

/** Props for the Page component. */
export interface PageProps {
  /** The content of the page */
  children: ReactNode;
  /** Optional custom class names for styling */
  className?: string;
  /** Whether the page is currently visible */
  show?: boolean;
}

/**
 * A wrapper component that provides fade in/out transitions for pages.
 * Handles the `display: none` toggle automatically after exit animations.
 */
export default function Page({children, className, show}: PageProps) {
  const [isHidden, setIsHidden] = useState<boolean>(!show);

  if (show && isHidden) {
    setIsHidden(false);
  }

  return (
    <motion.div
      onAnimationComplete={variant => {
        if (variant === 'exit' && !show) {
          setIsHidden(true);
        }
      }}
      initial="exit"
      variants={pageTransitionVariants}
      animate={show ? 'enter' : 'exit'}
      transition={{duration: 0.2, ease: [0.25, 0.1, 0.25, 1]}}
      className={['size-full', isHidden ? 'hidden' : 'block', className].filter(Boolean).join(' ')}>
      {children}
    </motion.div>
  );
}
