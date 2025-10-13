import {motion, type Variants} from 'framer-motion';
import {memo} from 'react';

const variants: Variants = {
  hover: {opacity: 0.5, width: '70%', transition: {duration: 0.3}},
  initial: {opacity: 0.3, width: '50%', transition: {duration: 0.7}},
};

type Props = {isInstalled: boolean; accentColor: string};
const PulsingLine = memo(({isInstalled, accentColor}: Props) => {
  if (!isInstalled) {
    return null;
  }

  const gradientStyle = {
    background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
  };

  return (
    <motion.div
      style={{
        ...gradientStyle,
        transform: 'translateX(-50%)',
        opacity: 0.3,
        width: '50%',
      }}
      variants={variants}
      className="absolute bottom-0 left-1/2 h-[1px] rounded-t-full"
    />
  );
});

export default PulsingLine;
