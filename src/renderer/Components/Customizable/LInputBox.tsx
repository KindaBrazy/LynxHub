/* eslint-disable jsx-a11y/no-autofocus */
// Import packages
import {ChangeEvent, useContext} from 'react';
import {motion, Variants} from 'framer-motion';
// Import components
import {getBlack, getLynxRaisinBlack, getWhite} from '../../../AppState/AppConstants';
import StatusContext, {StatusContextType} from '../GlobalStateContext';

type Props = {
  // Title of InputBox
  name?: string;
  // Extra class names for the root element
  extraClasses?: string;
  // Placeholder text when nothing is inputted
  hintText?: string;
  // Motion animation variants for root of InputBox (initial, animate, exit)
  animVariants?: Variants;
  // Set current inputted value
  setValue?: (newValue: string) => void;
  // Callback current inputted value and id of InputBox
  onValueChange?: (id: string, value: string) => void;
  // Autofocus when the parent component opened
  autoFocus?: boolean;
  defaultValue?: string;
};
export default function LInputBox({name, hintText, onValueChange, extraClasses, animVariants, setValue, autoFocus, defaultValue}: Props) {
  const {isDarkMode} = useContext(StatusContext) as StatusContextType;

  // Call setValue and onValueChange when user input any value
  const OnValueChange = (value: ChangeEvent<HTMLInputElement>) => {
    if (setValue) {
      if (value.target.value.length > 1) {
        setValue(value.target.value);
      } else {
        setValue('');
      }
    }
    if (onValueChange && name) onValueChange(name, value.target.value);
  };

  return (
    <motion.div
      variants={animVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={['mt-4 flex w-[95%] flex-row items-center', extraClasses].join(' ')}>
      {/* Title Text */}
      {name !== '' && <div className="ml-[4px] mr-4 flex cursor-default select-none items-center whitespace-nowrap text-[16pt]">{name}</div>}
      <motion.div
        whileHover={{borderColor: isDarkMode ? getWhite() : getBlack(), backgroundColor: isDarkMode ? getBlack(0.5) : getWhite(0.7)}}
        animate={{
          borderColor: isDarkMode ? getWhite(0.6) : getBlack(0.6),
          backgroundColor: isDarkMode ? getLynxRaisinBlack(0.6) : getWhite(0.4),
        }}
        className="flex h-10 w-full cursor-text select-none overflow-hidden rounded-xl
        border border-black/60 bg-black/60 px-4 outline-none dark:border-white/60">
        <input
          autoFocus={autoFocus}
          className="w-full bg-transparent text-[14pt] outline-none"
          type="text"
          defaultValue={defaultValue}
          placeholder={hintText}
          onInput={OnValueChange}
        />
      </motion.div>
    </motion.div>
  );
}

// Default values for props when not provided
LInputBox.defaultProps = {
  name: '',
  extraClasses: '',
  hintText: '',
  animVariants: null,
  setValue: null,
  onValueChange: null,
  autoFocus: true,
  defaultValue: '',
};
