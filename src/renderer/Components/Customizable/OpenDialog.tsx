// Import packages
import {useContext, useEffect, useRef, useState} from 'react';
import {motion} from 'framer-motion';
// Import modules
import {ipcUtil} from '../RendererIpcHandler';
import {getBlack, getLynxRaisinBlack, getWhite, getWhiteFourth, getWhiteSecond, getWhiteThird} from '../../../AppState/AppConstants';
import StatusContext, {StatusContextType} from '../GlobalStateContext';
// Import Assets
import {ThreeDots} from '../../../Assets/Icons/SvgIcons';

type Props = {
  // Extra class names for the root element
  extraClasses?: string;
  // OpenDialog title or category name (Showing in left side of drop down)
  categoryText?: string;
  // Currently selected path
  chosenDir?: string;
  // Set the currently selected path
  setChosenDir?: (value: string) => void;
  // Callback when the user selects a path
  onValueChange?: (id: string, dir: string) => void;
  placeHolder?: string;
  // Open dialog type, Select file or directory
  type: 'directory' | 'file';
  defaultDir?: string;
};
export default function OpenDialog({categoryText, onValueChange, setChosenDir, chosenDir, defaultDir, extraClasses, type, placeHolder}: Props) {
  const [hoverBox, setHoverBox] = useState(false);
  const [parentHeight, setParentHeight] = useState(0);
  const [localChosenDir, setLocalChosenDir] = useState<string>(defaultDir || '');

  // Reference to selected dir (span element) for adjusting height of dropdown
  const selectedItemRef = useRef<HTMLSpanElement>(null);

  const {isDarkMode} = useContext(StatusContext) as StatusContextType;

  useEffect(() => {
    if (!defaultDir || defaultDir === '\r') {
      setLocalChosenDir('');
    } else {
      setLocalChosenDir(defaultDir);
    }
  }, [defaultDir]);

  // Adjust height of self based on text length
  function adjustHeight() {
    if (selectedItemRef.current && selectedItemRef.current.offsetHeight) {
      setParentHeight(selectedItemRef.current.offsetHeight + 15);
    } else {
      setParentHeight(40);
    }
  }

  useEffect(() => {
    window.addEventListener('resize', () => {
      adjustHeight();
    });
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [chosenDir, localChosenDir, placeHolder]);

  // Handle component click and set result callback data to states
  const openDirectory = async () => {
    const result = await ipcUtil.openDialog(type === 'file' ? 'openFile' : 'openDirectory');
    if (result !== undefined) {
      if (onValueChange && categoryText) {
        setLocalChosenDir(result);
        onValueChange(categoryText, result);
      }
      if (setChosenDir) setChosenDir(result);
      console.log(result);
    }
  };

  return (
    <div className={['mt-4 flex w-[95%] flex-row items-center bg-red-600/0', extraClasses].join(' ')}>
      {/* Category text (Left side of the component) */}
      {categoryText !== undefined && (
        <div className="ml-[4px] mr-4 flex cursor-default select-none items-center whitespace-nowrap text-[16pt]">{categoryText}</div>
      )}
      <motion.div
        onMouseEnter={() => setHoverBox(true)}
        onMouseLeave={() => setHoverBox(false)}
        whileTap={{scale: 0.95}}
        onClick={openDirectory}
        whileHover={{borderColor: isDarkMode ? getWhite() : getBlack(), backgroundColor: isDarkMode ? getBlack(0.5) : getWhite()}}
        animate={{
          height: parentHeight,
          borderColor: isDarkMode ? getWhite(0.6) : getBlack(0.6),
          backgroundColor: isDarkMode ? getLynxRaisinBlack(0.6) : getWhiteSecond(),
        }}
        className="w-full cursor-default select-none overflow-hidden rounded-xl
        border border-black/60 bg-black/60 p-2 pl-4 outline-none dark:border-white/60">
        <motion.div className="flex h-full w-full flex-row items-center justify-between">
          {chosenDir && (
            <span ref={selectedItemRef} className="mr-3 break-all text-[14pt]">
              {chosenDir}
            </span>
          )}
          {localChosenDir && !chosenDir && (
            <span ref={selectedItemRef} className="mr-3 break-all text-[14pt]">
              {localChosenDir}
            </span>
          )}
          {/* Show placeholder if initialized, and chosenDir is not empty */}
          {!localChosenDir && !chosenDir && placeHolder && (
            <span ref={selectedItemRef} className="break-all text-[14pt] text-gray-400">
              {placeHolder}
            </span>
          )}
          <ThreeDots
            className={`z-0 h-[1.5rem] w-[1.5rem] min-w-fit transition duration-300 ${
              hoverBox ? 'fill-black dark:fill-white' : 'fill-black/70 dark:fill-white/70'
            }`}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

// Default values for props when not provided
OpenDialog.defaultProps = {
  categoryText: undefined,
  extraClasses: undefined,
  chosenDir: undefined,
  setChosenDir: null,
  onValueChange: null,
  placeHolder: undefined,
  defaultDir: undefined,
};
