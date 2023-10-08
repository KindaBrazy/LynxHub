// Import packages
import {useContext, useState} from 'react';
import {motion} from 'framer-motion';
// Import Assets
import {TickIcon} from '../../../Assets/Icons/SvgIcons';
// Import components
import {getBlack, getWhite, getWhiteFourth, getWhiteThird} from '../../../AppState/AppConstants';
import StatusContext, {StatusContextType} from '../GlobalStateContext';

type Props = {
  // CheckBox title and id
  name: string;
  // Extra class names for the root element
  extraClasses?: string;
  // Set checkbox enabled by default
  defaultEnabled?: boolean;
  // Whether highlight tick with app second color theme
  highlightEnabled?: boolean;
  // Callback when checkbox value change
  onValueChange?: (name: {id: string; value: string}, enabled: boolean) => void;
};

export default function LCheckBox({name, defaultEnabled, extraClasses, highlightEnabled, onValueChange}: Props) {
  const {isDarkMode} = useContext(StatusContext) as StatusContextType;
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [isHover, setIsHover] = useState(false);

  // Handle click on check box and update enabled state value
  const onClickHandle = () => {
    setEnabled((prevState) => {
      const newState = !prevState;
      if (onValueChange) {
        // Delay the execution of onValueChange to avoid state update during render
        setTimeout(() => onValueChange({id: name, value: ''}, newState), 0);
      }
      return newState;
    });
  };

  const getTickBorderColor = () => {
    const color = isDarkMode ? getWhite : getBlack;
    return color(isHover ? 1 : 0.5);
  };
  const getCompBgColor = () => {
    if (isDarkMode) {
      return isHover ? getBlack(0.5) : getBlack(0);
    }
    return isHover ? getWhiteFourth(1) : getWhiteFourth(0);
  };

  return (
    <motion.div
      whileTap={{scale: 0.95, backgroundColor: getBlack(0.4), transition: {duration: 0.2}}}
      animate={{backgroundColor: getCompBgColor()}}
      onClick={onClickHandle}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={['flex flex-row items-center rounded-xl px-4 py-2', extraClasses].join(' ')}>
      {/* Title Text */}
      <span className={`mr-4 text-[16pt] transition duration-500 ${enabled && highlightEnabled ? 'text-LynxBlue' : 'text-black dark:text-white'}`}>
        {name}
      </span>
      {/* Tick container */}
      <motion.div
        animate={{borderRadius: '9px', borderColor: getTickBorderColor()}}
        transition={{duration: 0.5}}
        className={`h-8 w-8 overflow-hidden rounded-xl border-black dark:border-white border${isHover ? '-2' : ''}`}>
        {/* Tick background */}
        <motion.div
          initial={{scale: 0, opacity: 0}}
          animate={{scale: enabled ? 1 : 0, opacity: enabled ? 1 : 0, transition: {duration: 1, type: 'spring', bounce: 0.7}}}
          whileHover={{backgroundColor: isDarkMode ? getBlack(0.8) : getWhiteThird()}}
          className="bg-LynxWhiteSecond p-1 dark:bg-black/50">
          {/* Tick Icon */}
          <TickIcon className="h-full w-full stroke-LynxBlue stroke-[2]" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Default values for props when not provided
LCheckBox.defaultProps = {
  defaultEnabled: false,
  extraClasses: '',
  highlightEnabled: true,
  onValueChange: null,
};
