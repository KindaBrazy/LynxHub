// import basic style
import './App.scss';
// import packages
import {RefObject, useEffect, useMemo, useRef, useState} from 'react';
import {WebviewTag} from 'electron';
import {motion} from 'framer-motion';
// import modules
import {ipcUserData, ipcWindowManager} from './RendererIpcHandler';
// import components
import TitleBar from './TitleBar/TitleBar';
import SideBar from './SideBar/SideBar';
import Sda1WebUi from './WebuiCard/Sda1WebUi';
import StatusContext, {StatusContextType} from './GlobalStateContext';
import BlockBackground from '../Windows/BlockBackground';
import WebUiViewer from './Launcher/WebUiViewer';
import {RendererLogError, WebuiList} from '../../AppState/AppConstants';
import SdLshWebUi from './WebuiCard/SdLshWebUi';
import {AppConfig} from '../../AppState/InterfaceAndTypes';
import OOBABOOGAWebUI from './WebuiCard/OOBABOOGAWebUI';

const sideBarPictureId: string = 'sideBarPicture';
const sideBarTextId: string = 'sideBarText';

export default function App() {
  // Whether user theme is on dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Block background of an opened window to be not interactive
  const [blockBackground, setBlockBackground] = useState<boolean>(false);
  const [selectedPage, setSelectedPage] = useState<string>(sideBarPictureId);
  const [installedWebUi, setInstalledWebUi] = useState<WebuiList>({AUTOMATIC1111: false, LSHQQYTIGER: false, OOBABOOGA: false});
  const [webuiRunning, setWebuiRunning] = useState<boolean>(false);

  const webViewRef = useRef<WebviewTag>(null);

  const [webuiLaunch, setWebuiLaunch] = useState<{
    webViewRef: RefObject<WebviewTag>;
    currentView: 'terminal' | 'webView';
    currentAddress: string;
  }>({webViewRef, currentView: 'terminal', currentAddress: ''});

  useEffect(() => {
    // initialize isDarkMode state
    async function initDarkMode() {
      const value = await ipcWindowManager.getCurrentDarkMode();
      if (value !== undefined) {
        if (value === 'light') setIsDarkMode(false);
        if (value === 'dark') setIsDarkMode(true);
      }
    }

    initDarkMode();

    /* ipcWindowManager.onDarkModeChange((_event, darkMode: boolean) => {
      setIsDarkMode(darkMode);
    }); */

    // Get app config and initialize sda1Installed whether webui is installed or not
    ipcUserData
      .getUserData()
      .then((value: AppConfig) => {
        // @ts-ignore
        setInstalledWebUi({
          AUTOMATIC1111: value.WebUi.AUTOMATIC1111?.installed,
          LSHQQYTIGER: value.WebUi.LSHQQYTIGER?.installed,
          OOBABOOGA: value.WebUi.OOBABOOGA?.installed,
        });
        return value;
      })
      .catch((error) => console.log(RendererLogError(error)));
  }, []);

  // Initialize GlobalStateContext with useMemo
  const contextValue: StatusContextType = useMemo(
    () => ({
      blockBackground,
      setBlockBackground,
      installedWebUi,
      setInstalledWebUi,
      webuiRunning,
      setWebuiRunning,
      selectedPage,
      setSelectedPage,
      webuiLaunch,
      setWebuiLaunch,
      isDarkMode,
      setIsDarkMode,
    }),
    [isDarkMode, blockBackground, installedWebUi, webuiRunning, webuiLaunch, selectedPage],
  );

  /* (Main Component)
   *
   * [MainWindowBlock] Blocking background interactive when showing a window (Like installing webui)
   * Using props to showing background block because of AnimatePresence for enter and exit animation
   *
   * [TitleBar] Main app title bar
   *
   * [SideBar] Main sidebar for AI pages, settings etc...
   *
   * [webuiRunning] If webui is running, show {WebUiViewer} to show webui browser like
   * If webui is not running showing install or run webui
   *
   * [InstallSD] The window component for installing specif webui
   *
   */

  return (
    <StatusContext.Provider value={contextValue}>
      <BlockBackground ShowBlock={blockBackground} />
      <TitleBar />
      <SideBar />
      {/* Webui cards container */}
      <div className="absolute bottom-0 left-24 right-0 top-10 overflow-hidden">
        {webuiRunning ? (
          <WebUiViewer />
        ) : (
          <>
            <motion.div
              className="absolute flex h-full w-full flex-wrap content-start opacity-0"
              animate={{
                translateY: selectedPage === sideBarPictureId ? '0px' : '-700px',
                opacity: selectedPage === sideBarPictureId ? 1 : 0,
              }}
              transition={{
                ease: selectedPage === sideBarPictureId ? 'backOut' : 'backIn',
                duration: 0.3,
                delay: selectedPage === sideBarPictureId ? 0.15 : 0,
              }}>
              {/* Automatic1111 WebUi */}
              <Sda1WebUi />
              {/* LSHQQYTIGER (DirectMl) WebUi */}
              <SdLshWebUi />
            </motion.div>
            <motion.div
              className="absolute flex h-full w-full flex-wrap content-start opacity-0"
              animate={{
                translateY: selectedPage === sideBarTextId ? '0px' : '700px',
                opacity: selectedPage === sideBarTextId ? 1 : 0,
              }}
              transition={{
                ease: selectedPage === sideBarTextId ? 'backOut' : 'backIn',
                duration: 0.3,
                delay: selectedPage === sideBarTextId ? 0.15 : 0,
              }}>
              {/* OOBABOOGAWebUI WebUi */}
              <OOBABOOGAWebUI />
            </motion.div>
          </>
        )}
      </div>
    </StatusContext.Provider>
  );
}
