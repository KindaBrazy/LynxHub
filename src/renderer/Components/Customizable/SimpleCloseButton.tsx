import {motion} from 'framer-motion';
import React from 'react';
import {SimpleClose} from '../../../Assets/Icons/SvgIcons';

type Props = {
  // Extra class names for the root element
  extraClasses?: string;
  // On button click
  onClick?: () => void;
};
export default function SimpleCloseButton({extraClasses, onClick}: Props) {
  return (
    <motion.div
      initial={{borderRadius: '0.5rem'}}
      whileHover={{backgroundColor: 'rgb(220 38 38)', transition: {duration: 0.3}}}
      whileTap={{scale: 0.9, borderRadius: '0.7rem', transition: {duration: 0.1, type: 'spring'}}}
      onClick={onClick}
      className={['absolute right-2 top-2 p-1', extraClasses].join(' ')}>
      <SimpleClose className="imgDarkLightFilter h-[25px] w-[25px]" />
    </motion.div>
  );
}
// Default values for props when not provided
SimpleCloseButton.defaultProps = {
  extraClasses: '',
  onClick: null,
};
