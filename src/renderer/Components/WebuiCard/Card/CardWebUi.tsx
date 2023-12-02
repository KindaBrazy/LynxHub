// Import packages
import React, {useContext, useEffect, useState} from 'react';
import {AnimatePresence, motion, Variants} from 'framer-motion';

// Import modules
import {ipcBackendRuns, ipcUserData, ipcUtil, ipcWindowManager} from '../../RendererIpcHandler';
import {getBlack, getLynxRaisinBlack, getWhite, RendererLogError, RendererLogInfo} from '../../../../AppState/AppConstants';
import StatusContext, {StatusContextType} from '../../GlobalStateContext';
// Import components
import CardButton from './CardButton';
// Import assets
import SettingsIcon from '../../../../Assets/Icons/Category/Settings.png';
import {PlayIcon} from '../../../../Assets/Icons/SvgIcons';
import {getIsInstalledById, setInstalledWebUiById} from '../../../../CrossProcessModules/CrossFunctions';
import InstallSD from '../../../Windows/InstallSD';

type WebUiData = {
  // WebUi developer, GitHub repository username (Also will be used for Repository fetch url to use for identification, and id)
  repoUserName: string;
  // WebUi developer, GitHub repository user avatar image
  repoAvatarImg: string;
  // WebUi card background image
  cardBackgroundImg: string;
  // Position of background image (Tailwind string)
  cardBackgroundPosition: string;
  // Description of the WebUi
  webUiDesc: string;
};
type Props = {
  webuiData: WebUiData;
  haveSettingsMenu?: boolean;
  // Callback on setting button click
  toggleSettings?: () => void;
};
export default function CardWebUi({webuiData, haveSettingsMenu, toggleSettings}: Props) {
  const [hoverLaunch, setHoverLaunch] = useState(false);
  const {isDarkMode, installedWebUi, setInstalledWebUi, setWebuiRunning, setBlockBackground} = useContext(StatusContext) as StatusContextType;
  const [isWebuiInstalled, setIsWebuiInstalled] = useState<boolean>(getIsInstalledById(webuiData.repoUserName, installedWebUi));
  const [installWebui, setInstallWebui] = useState<boolean>(false);

  useEffect(() => {
    setIsWebuiInstalled(getIsInstalledById(webuiData.repoUserName, installedWebUi));
  }, [installedWebUi]);

  // Handle on locating repo click
  const handleLocateClick = async () => {
    setBlockBackground((prevState) => !prevState);
    await ipcUtil
      .locateRepo(webuiData.repoUserName)
      .then((result) => {
        setBlockBackground((prevState) => !prevState);
        console.log(RendererLogInfo(result));
        // If locate was valid, read launch data from batch file
        if (result) {
          setInstalledWebUiById(webuiData.repoUserName, setInstalledWebUi);
          if (haveSettingsMenu) ipcUserData.readLaunchDataFromFile(webuiData.repoUserName);
        }
        return null;
      })
      .catch((error) => {
        setBlockBackground((prevState) => !prevState);
        console.log(RendererLogError(error));
      });
  };

  // Handle on installation webui click
  const handleInstallClick = () => {
    setInstallWebui(true);
  };

  // Run WebUi
  const RunSda1 = () => {
    // Start backend pty terminal and run batch file
    ipcBackendRuns.ptyProcess('start', webuiData.repoUserName);
    setWebuiRunning({running: true, uiName: webuiData.repoUserName});
    ipcWindowManager.setDiscordWebUIRunning({running: true, uiName: webuiData.repoUserName});
  };

  /* ----------------------------- Motion framer animations ----------------------------- */

  // Card container animation motion variants
  const cardEnterVariants: Variants = {
    initial: {
      opacity: 0,
      scale: 0.7,
      translateY: '0px',
    },
    animate: {
      opacity: 1,
      scale: 1,
      translateY: '0px',
      transition: {
        duration: 0.7,
        type: 'spring',
        delay: 0.05,
      },
    },
  };

  // Actual card animation motion variants
  const cardVariants: Variants = {
    hover: {
      borderColor: isDarkMode ? getWhite(0.5) : getBlack(0.5),
      borderRadius: '17px',
      transition: {
        duration: 0.5,
      },
    },
    animate: {borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', transition: {duration: 0.5}},
  };

  // Repository user avatar motion animation variants
  const avatarVariant: Variants = {
    initial: {opacity: 0, scale: 0, translateX: '-50%', borderRadius: '70px'},
    animate: {opacity: 1, scale: 1, borderRadius: '70px', transition: {duration: 0.6, type: 'spring', delay: 0.1}},
    hover: {borderRadius: '20px'},
  };

  // Description WebUi motion animation variants
  const descVariant: Variants = {
    initial: {opacity: 0, bottom: '-200px'},
    animate: {
      opacity: 1,
      bottom: '0px',
      height: isWebuiInstalled ? '150px' : '180px',
      transition: {duration: 0.4, type: 'tween', ease: 'easeOut'},
    },
    hover: {
      borderColor: isDarkMode ? getWhite(0.7) : getBlack(0.7),
      transition: {duration: 0.3},
    },
  };

  // Launch button motion animation variants
  const buttonVariants: Variants = {
    hover: {
      borderColor: isDarkMode ? getWhite(0.4) : getBlack(0.7),
      backgroundColor: isDarkMode ? getLynxRaisinBlack(0.7) : getWhite(0.7),
      color: isDarkMode ? getWhite() : getBlack(),
      transition: {
        duration: 0.3,
        type: 'spring',
      },
    },
    tap: {
      borderColor: isDarkMode ? getWhite(0.2) : getBlack(0.3),
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
      backgroundColor: isDarkMode ? getBlack(0.5) : getWhite(0.6),
      color: isDarkMode ? getWhite(0.8) : getBlack(0.9),
      scale: 1,
      translateY: '-50%',
      transition: {
        duration: 0.3,
        type: 'spring',
      },
    },
  };

  return (
    <>
      <motion.div
        transition={{delay: 0.3, type: 'spring', duration: 0.7}}
        variants={cardEnterVariants}
        initial="initial"
        animate="animate"
        className="relative ml-8 mt-6 h-[405px] w-[300px]">
        {/* Webui repository developer avatar */}
        <motion.div
          variants={avatarVariant}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="relative left-1/2 z-10 h-32 w-32 -translate-x-1/2 overflow-hidden border-2
           border-LynxRaisinBlack/70 shadow-Card dark:border-white">
          <img src={webuiData.repoAvatarImg} alt="AUTOMATIC1111" className="pointer-events-none" />
        </motion.div>

        {/* Stable Diffusion card background */}
        <motion.div
          variants={cardVariants}
          animate="animate"
          whileHover="hover"
          className="absolute top-[64px] flex h-[86%] w-full overflow-hidden rounded-3xl
        border-2 border-black/30 text-center shadow-Card dark:border-white/30">
          <img src={webuiData.cardBackgroundImg} alt="Stable Diffusion" className={`h-full object-none ${webuiData.cardBackgroundPosition}`} />

          {/* WebUi description */}
          <motion.div
            variants={descVariant}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="absolute bottom-0 flex h-[180px] w-full flex-col items-center rounded-t-[40px] border-t border-black/30
             bg-LynxWhiteSecond/50 backdrop-blur-2xl backdrop-brightness-150 dark:border-white/30 dark:bg-LynxRaisinBlack/50
              dark:backdrop-blur-xl dark:backdrop-brightness-50">
            {/* Repo user name */}
            <h2 className="pointer-events-none mt-4 select-none font-Lato text-lg font-black">{webuiData.repoUserName}</h2>

            {/* Description */}
            <h2 className="pointer-events-none mt-1 select-none font-Lato text-lg font-normal text-gray-900 dark:font-light dark:text-gray-300">
              {webuiData.webUiDesc}
            </h2>

            {/* Line seperator between description and action buttons  */}
            <div className="cardSeperator mt-3 w-[85%]" />

            {/* If webui installed just show launch and setting, if not shows install and locate */}
            {isWebuiInstalled ? (
              <div className={`absolute bottom-0 left-1/2 flex h-[40%] w-full -translate-x-1/2 ${haveSettingsMenu ? '' : 'justify-center'}`}>
                {haveSettingsMenu && (
                  <>
                    {/* Setting button */}
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      animate="animate"
                      onClick={toggleSettings}
                      className="absolute right-4 top-1/2 h-[70%] -translate-y-1/2 rounded-xl border bg-black/40 p-2">
                      <img src={SettingsIcon} className="imgDarkLightFilter pointer-events-none h-full w-full" alt="SDA1 Setting" />
                    </motion.div>
                  </>
                )}
                {/* Launch button */}
                <motion.div
                  onMouseEnter={() => setHoverLaunch(true)}
                  onMouseLeave={() => setHoverLaunch(false)}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  animate="animate"
                  onClick={RunSda1}
                  className={`absolute ${
                    haveSettingsMenu ? 'left-4 w-[50%]' : 'w-[90%]'
                  } top-1/2 h-[70%] -translate-y-1/2 rounded-xl border bg-black/40 outline-none`}>
                  <PlayIcon
                    className={`pointer-events-none absolute left-1 top-1/2 h-[55%] -translate-y-1/2 transition duration-150 ${
                      hoverLaunch ? 'fill-LynxPurple' : 'fill-LynxBlue'
                    }`}
                  />
                  <span className="sideBarSeperatorVertical absolute left-10 top-1/2 h-[90%] w-[0.11rem] -translate-y-1/2" />
                  <span
                    className={`absolute ${haveSettingsMenu ? 'left-[3.9rem]' : 'left-28'} top-1/2 -translate-y-1/2 cursor-default  select-none
                  font-Lato text-xl font-normal transition duration-150 ${hoverLaunch ? 'text-LynxPurple' : 'text-LynxBlue'}`}>
                    Launch
                  </span>
                </motion.div>
              </div>
            ) : (
              <div className="absolute bottom-0 left-1/2 flex h-[50%] w-[95%] -translate-x-1/2 flex-row outline-none">
                {/* Install button */}
                <CardButton text="Install" onClick={handleInstallClick} extraClasses="basis-1/2" />

                {/* Locate button */}
                <CardButton text="Locate" onClick={handleLocateClick} extraClasses="basis-1/2" />
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
      <AnimatePresence>{installWebui && <InstallSD repoUserName={webuiData.repoUserName} setInstallWebui={setInstallWebui} />}</AnimatePresence>
    </>
  );
}
CardWebUi.defaultProps = {
  haveSettingsMenu: true,
  toggleSettings: undefined,
};
