import {motion} from 'framer-motion';
import React, {useContext} from 'react';
import {SimpleClose} from '../../../Assets/Icons/SvgIcons';
import StatusContext, {StatusContextType} from '../GlobalStateContext';

type Props = {
  percent: Number;
  // Extra class names for the root element
  extraClasses?: string;
  // Button to cancel progress
  cancelButton?: boolean;
  // If cancelButton when clicked call onCancel
  onCancel?: () => void;
};

export default function ProgressBar({percent = 0, extraClasses, cancelButton, onCancel}: Props) {
  const {isDarkMode} = useContext(StatusContext) as StatusContextType;
  return (
    <div className={['mt-4 flex h-[25px] w-[95%] flex-row items-center', extraClasses].join(' ')}>
      <div
        className="bg-LynxWhiteThird h-full w-full overflow-hidden rounded-full border border-black/40 shadow-lg
      transition duration-300 hover:border-black/70 dark:border-white/40 dark:bg-LynxRaisinBlack dark:hover:border-white/50">
        <motion.div
          initial={{width: '0%'}}
          animate={{width: `${percent}%`, transition: {type: 'spring', bounce: 0.2}}}
          className="h-full rounded-full bg-LynxBlue"
        />
      </div>
      {cancelButton && (
        <motion.div
          whileHover={{backgroundColor: 'rgb(220 38 38)', transition: {duration: 0.3}}}
          whileTap={{scale: 0.8, transition: {duration: 0.1, type: 'spring'}}}
          onClick={() => {
            if (onCancel) onCancel();
          }}
          className="ml-1 rounded-lg p-1">
          <SimpleClose className="imgDarkLightFilter h-[25px] w-[25px]" />
        </motion.div>
      )}
    </div>
  );
}
ProgressBar.defaultProps = {
  extraClasses: undefined,
  cancelButton: false,
  onCancel: undefined,
};
