// Import Packages
import React, {useContext} from 'react';
import {motion} from 'framer-motion';
// Import Components
import {ipcWindowManager} from '../RendererIpcHandler';
import StatusContext, {StatusContextType} from '../GlobalStateContext';
// Import Assets
import {MinimizeIcon, MaximizeIcon, CloseIcon, LightMode, DarkMode} from '../../../Assets/Icons/SvgIcons';
import AppIconImg from '../../../Assets/Icons/Main/AppIcon.png';
import TitleBarWebUi from './TitleBarWebUi';
import {getBlack} from '../../../AppState/AppConstants';

const WindowManager = (operation: 'Maximize' | 'Minimize' | 'Close') => {
  ipcWindowManager.changeWindowState(operation);
};

const commonButtonsStyle: string = 'notDraggable cursor-default transition-colors duration-300 ease-out';

export default function TitleBar() {
  const {webuiRunning, isDarkMode, setIsDarkMode} = useContext(StatusContext) as StatusContextType;

  const handleToggleTheme = () => {
    setIsDarkMode((prevState) => !prevState);
    ipcWindowManager.changeDarkMode('toggle');
  };
  return (
    <div
      className="draggable sticky z-50 flex h-10 w-full items-center justify-between overflow-hidden 
    bg-black/10 transition-colors duration-500 dark:bg-white/5">
      {/* Left of the title bar items */}
      <div className="flex h-full items-center">
        {/* App Icon */}
        <img src={AppIconImg} className="m-1 ml-2 h-6 w-6" alt="App Icon" />

        {/* App Name */}
        <span className="mb-[2px] ml-1 text-[15pt] font-light text-black transition-colors duration-100 dark:text-white">AIOne Lynx</span>

        {!webuiRunning.running && (
          <>
            {/* Toggle light/dark mode */}
            <motion.div
              animate={{backgroundColor: getBlack(0), transition: {duration: 0.5}}}
              whileHover={{backgroundColor: getBlack(0.2), transition: {duration: 0.5}}}
              whileTap={{scale: 0.7, backgroundColor: getBlack(0.4), borderRadius: '12px', transition: {duration: 0.1}}}
              onClick={handleToggleTheme}
              className="notDraggable hs-9 ml-2 flex w-9 rounded-md">
              {isDarkMode ? (
                <DarkMode className="notDraggable m-[7px] h-full w-full fill-white" />
              ) : (
                <LightMode className="notDraggable m-[7px] h-full w-full fill-black/70" />
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Webui Controls */}
      {webuiRunning.running && <TitleBarWebUi />}

      {/* Right of the title bar items */}
      <div className="flex h-full">
        {/* Minimize */}
        <button
          className={[commonButtonsStyle, 'px-4 hover:bg-black/[0.15] dark:hover:bg-white/[0.15]'].join(' ')}
          type="button"
          onClick={() => WindowManager('Minimize')}>
          <MinimizeIcon className="h-[1.1rem] w-[1.1rem] fill-black dark:fill-white" />
        </button>

        {/* Maximize */}
        <button
          className={[commonButtonsStyle, 'px-4 hover:bg-black/[0.15] dark:hover:bg-white/[0.15]'].join(' ')}
          type="button"
          onClick={() => WindowManager('Maximize')}>
          <MaximizeIcon className="h-[1rem] w-[1rem] fill-black dark:fill-white" />
        </button>

        {/* Close */}
        <button className={[commonButtonsStyle, 'pl-3 pr-[0.9rem] hover:bg-red-600'].join(' ')} type="button" onClick={() => WindowManager('Close')}>
          <CloseIcon className="h-[1.17rem] w-[1.17rem] fill-black dark:fill-white" />
        </button>
      </div>
    </div>
  );
}
