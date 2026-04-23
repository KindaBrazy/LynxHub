import {motion, Variants} from 'framer-motion';
import {ReactNode} from 'react';

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
}

/**
 * A wrapper component that provides fade in/out transitions for pages.
 * Handles the `display: none` toggle automatically after exit animations.
 */
export default function Page({children, className}: PageProps) {
  return (
    <motion.div
      initial="exit"
      animate={'enter'}
      variants={pageTransitionVariants}
      transition={{duration: 0.2, ease: [0.25, 0.1, 0.25, 1]}}
      className={['size-full', className].filter(Boolean).join(' ')}>
      {children}
    </motion.div>
  );
}
