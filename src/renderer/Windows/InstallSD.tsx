import {motion, useIsPresent, Variants} from 'framer-motion';
import React, {useContext, useEffect, useState} from 'react';
import OpenDialog from '../Components/Customizable/OpenDialog';
import {getBlack, getWebUiUrlByName, getWhite, getWhiteFourth, getWhiteThird} from '../../AppState/AppConstants';
import StatusContext, {StatusContextType} from '../Components/GlobalStateContext';
import SimpleCloseButton from '../Components/Customizable/SimpleCloseButton';
import {ipcUserData, ipcUtil} from '../Components/RendererIpcHandler';
import ProgressBar from '../Components/Customizable/ProgressBar';
import {getDefaultDirByID, setInstalledWebUiById} from '../../CrossProcessModules/CrossFunctions';

type Props = {
  setInstallWebui: React.Dispatch<React.SetStateAction<boolean>>;
  repoUserName: string;
};

export default function InstallSD({repoUserName, setInstallWebui}: Props) {
  const {isDarkMode, setBlockBackground, setInstalledWebUi} = useContext(StatusContext) as StatusContextType;
  const [hoverSaveBtn, setHoverSaveBtn] = useState<boolean>();

  const isPresent = useIsPresent();

  const [defaultInstallLocation, setDefaultInstallLocation] = useState<string>();

  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [chosenDir, setChosenDir] = useState<string>();
  const [installProgress, setInstallProgress] = useState<{installPercent: number; totalItems: number; processedItems: number}>({
    installPercent: 0,
    processedItems: 0,
    totalItems: 0,
  });

  useEffect(() => {
    ipcUtil
      .getAppPath()
      .then((value) => {
        setDefaultInstallLocation(`${value}${getDefaultDirByID(repoUserName)}`);
        setChosenDir(`${value}${getDefaultDirByID(repoUserName)}`);
        return null;
      })
      .catch(console.log);
  }, []);

  useEffect(() => {
    setBlockBackground(isPresent);
  }, [isPresent]);

  // Open webUi repository address in user browser
  const openUrl = () => {
    window.open(getWebUiUrlByName(repoUserName));
  };

  // Close install window
  const handleClose = () => {
    setInstallWebui((prevState) => !prevState);
  };

  const handleInstall = () => {
    setIsInstalling((prevState) => !prevState);
    if (chosenDir) ipcUtil.cloneRepo(repoUserName, chosenDir);
    ipcUtil.getCloneProgress((_event, progress) => {
      if (progress === 'Completed') {
        setInstalledWebUiById(repoUserName, setInstalledWebUi);
        ipcUserData.readLaunchDataFromFile(repoUserName);
        setInstallWebui((prevState) => !prevState);
      } else {
        setInstallProgress({installPercent: progress.progress, totalItems: progress.total, processedItems: progress.processed});
      }
    });
  };

  // Save button motion animation variants
  const buttonVariantsSettings: Variants = {
    hover: {
      borderColor: isDarkMode ? getWhite(0.4) : getBlack(0.7),
      backgroundColor: isDarkMode ? getBlack(0.5) : getWhiteFourth(0.7),
      color: isDarkMode ? getWhite() : getBlack(),
      transition: {
        duration: 0.3,
        type: 'spring',
      },
    },
    tap: {
      borderColor: isDarkMode ? getWhite(0.2) : getBlack(0.3),
      backgroundColor: isDarkMode ? getBlack(0.3) : getWhite(0.3),
      scale: 0.95,
      borderRadius: '20px',
      transition: {
        duration: 0.1,
        type: 'spring',
      },
    },
    animate: {
      borderColor: isDarkMode ? getBlack(0.3) : getWhiteFourth(),
      backgroundColor: isDarkMode ? getBlack(0.2) : getWhiteThird(0.6),
      color: isDarkMode ? getWhite(0.8) : getBlack(0.9),
      scale: 1,
      transition: {
        duration: 0.3,
        type: 'spring',
      },
    },
  };

  return (
    <motion.section
      initial={{opacity: 0, scale: 0.8, translateY: '-50%', translateX: '-50%', height: '410px'}}
      animate={{opacity: 1, scale: 1, height: isInstalling ? '200px' : '440px', transition: {duration: 0.3, ease: 'backOut'}}}
      exit={{opacity: 0, scale: 0.8, transition: {duration: 0.2, ease: 'backIn', delay: 0.05}}}
      className="fixed left-1/2 top-1/2 z-40 mt-5 flex w-[740px] flex-col items-center overflow-hidden
          rounded-3xl border border-black/60 bg-white/50 text-black backdrop-blur-2xl dark:border-white/60
          dark:bg-white/10 dark:text-white">
      {!isInstalling ? (
        <>
          <SimpleCloseButton onClick={handleClose} />
          <h1 className="mb-4 mt-4 cursor-default select-none text-3xl font-semibold">Install WebUi</h1>
          <span className="mx-5 mt-4 text-black/60 dark:text-white/60">
            You are about to <span className="text-black dark:text-white">install</span> (clone){' '}
            <span className="text-black dark:text-white">Stable Diffusion</span> WebUi Repository by{' '}
            <span className="text-black dark:text-white">{repoUserName}</span> :
          </span>
          <div
            className="mx-5 mt-2 self-start text-[14pt] text-black/70 transition duration-150
          hover:text-black dark:text-white/50 dark:hover:text-white/80">
            <button type="button" onClick={openUrl} className="hover:underline">
              {getWebUiUrlByName(repoUserName)}
            </button>
          </div>
          <OpenDialog
            categoryText="Directory :"
            defaultDir={defaultInstallLocation}
            placeHolder="Choose directory to install"
            extraClasses="!mt-12"
            type="directory"
            setChosenDir={setChosenDir}
            chosenDir={chosenDir}
          />
          <div className="flex h-[5rem] w-full items-center justify-around">
            {/* Save data button */}
            <motion.div
              onMouseEnter={() => setHoverSaveBtn(true)}
              onMouseLeave={() => setHoverSaveBtn(false)}
              variants={buttonVariantsSettings}
              whileHover="hover"
              whileTap="tap"
              animate="animate"
              onClick={handleInstall}
              className="absolute bottom-5 mt-8 flex h-14 w-[95%] items-center justify-center rounded-xl border bg-black/40 outline-none">
              <span
                className={`cursor-default select-none text-xl font-normal transition duration-300 ${
                  hoverSaveBtn ? 'text-LynxPurple' : 'text-LynxBlue'
                }`}>
                Install
              </span>
            </motion.div>
          </div>
        </>
      ) : (
        <>
          {/* Installing progress window */}
          <h1 className="mb-4 mt-4 cursor-default select-none text-3xl font-semibold">Installing...</h1>
          {/* Progress bar */}
          <ProgressBar percent={installProgress.installPercent} extraClasses="mt-4" />
          <div
            className="mt-7 flex flex-row items-center justify-around rounded-md border-2 border-LynxWhiteFourth px-2 transition
              duration-300 hover:border-LynxWhiteThird dark:border-white/10 dark:hover:border-white/20">
            {/* Downloaded items */}
            <span className="mx-2">{`Downloaded: ${installProgress.processedItems}`}</span>
            {/* Seperator */}
            <div className="h-full w-[2px] bg-LynxWhiteThird dark:bg-white/20" />
            {/* Total items */}
            <span className="mx-2">{`Total: ${installProgress.totalItems}`}</span>
          </div>
        </>
      )}
    </motion.section>
  );
}
