// Import Packages
import React, {useContext} from 'react';
import {motion, Variants} from 'framer-motion';
// Import Modules
import StatusContext, {StatusContextType} from '../../GlobalStateContext';
import {getBlack, getLynxRaisinBlack, getWhite} from '../../../../AppState/AppConstants';

type Props = {
  // Callback on button click
  onClick?: () => void;
  // Extra class names for the root element
  extraClasses?: string;
  // Button inner text
  text: string;
};

export default function CardButton({extraClasses, text, onClick}: Props) {
  const {isDarkMode} = useContext(StatusContext) as StatusContextType;

  // Animation motion variants
  const buttonVariants: Variants = {
    hover: {
      borderColor: isDarkMode ? getWhite(0.4) : getBlack(0.8),
      backgroundColor: isDarkMode ? getLynxRaisinBlack(0.7) : getWhite(0.8),
      scale: 1.05,
      transition: {
        duration: 0.3,
        type: 'spring',
      },
    },
    tap: {
      borderColor: isDarkMode ? getWhite(0.2) : getWhite(0.3),
      backgroundColor: isDarkMode ? getBlack(0.3) : getWhite(0.3),
      scale: 0.9,
      borderRadius: '17px',
      transition: {
        duration: 0.2,
        type: 'spring',
      },
    },
    animate: {
      borderColor: isDarkMode ? getBlack(0.3) : getWhite(0.7),
      backgroundColor: isDarkMode ? getBlack(0.5) : getWhite(0.5),
      color: isDarkMode ? getWhite(0.8) : getBlack(0.8),
      scale: 1,
      transition: {
        duration: 0.3,
        type: 'spring',
      },
    },
  };

  return (
    <motion.button
      variants={buttonVariants}
      type="button"
      whileHover="hover"
      whileTap="tap"
      animate="animate"
      onClick={onClick}
      className={['m-2 h-14 cursor-default self-center rounded-xl border text-xl font-semibold', extraClasses].join(' ')}>
      {`${text}`}
    </motion.button>
  );
}

// Default values for props when not provided
CardButton.defaultProps = {
  extraClasses: undefined,
  onClick: null,
};
