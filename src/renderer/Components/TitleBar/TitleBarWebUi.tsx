// Import Packages
import React, {useContext} from 'react';
import {motion} from 'framer-motion';
// Import Components
import {ipcBackendRuns} from '../RendererIpcHandler';
import StatusContext, {StatusContextType} from '../GlobalStateContext';
import {getBlack} from '../../../AppState/AppConstants';
// Import Assets
import {ReloadIcon, SimpleArrow, StopFilled} from '../../../Assets/Icons/SvgIcons';

// TODO: Copy the address of the webui when clicked on span element and when holding CTRL open in external user browser

// When a webui is running show action buttons at the center of the title bar for refresh, switch between terminal and webview, etc.
export default function TitleBarWebUi() {
  const {webuiLaunch, setWebuiLaunch, setWebuiRunning} = useContext(StatusContext) as StatusContextType;

  // Switch between terminal and webview
  const handlePageSwap = () => {
    const resultValue: 'webView' | 'terminal' = webuiLaunch.currentView === 'terminal' ? 'webView' : 'terminal';
    setWebuiLaunch({webViewRef: webuiLaunch.webViewRef, currentView: resultValue, currentAddress: webuiLaunch.currentAddress});
  };

  // Terminate currently running webui by stopping pty process
  const handleStopWebUi = () => {
    ipcBackendRuns.ptyProcess('stop', '');
    setWebuiLaunch({webViewRef: webuiLaunch.webViewRef, currentView: 'terminal', currentAddress: ''});
    setWebuiRunning(false);
  };

  // Reload webview element
  const handleReload = () => {
    // Check if any address is passed to webview and reference to it is not null
    if (webuiLaunch.currentAddress !== '' && webuiLaunch.webViewRef.current) webuiLaunch.webViewRef.current?.reload();
  };

  return (
    <div className="mt-[1px] flex items-center">
      {/* Show current running webui address and reload button when user is in webview */}
      {webuiLaunch.currentView === 'webView' && (
        <>
          {/* Reload WebUi */}
          <motion.div
            animate={{backgroundColor: getBlack(0), transition: {duration: 0.5}}}
            whileHover={{backgroundColor: getBlack(0.2), transition: {duration: 0.5}}}
            whileTap={{scale: 0.7, backgroundColor: getBlack(0.4), borderRadius: '12px', transition: {duration: 0.1}}}
            onClick={handleReload}
            className="notDraggable flex h-9 w-9 rounded-md p-[7px]">
            <ReloadIcon className="notDraggable h-full w-full stroke-black/70 dark:stroke-white/90" />
          </motion.div>

          {/* Address of current running webui */}
          <motion.div
            animate={{backgroundColor: getBlack(0), transition: {duration: 0.5}}}
            whileHover={{backgroundColor: getBlack(0.2), transition: {duration: 0.5}}}
            whileTap={{scale: 0.9, backgroundColor: getBlack(0.4), borderRadius: '12px', transition: {duration: 0.1}}}
            className="notDraggable ml-1 flex rounded-md px-[15px] py-[4px]">
            <span className="text-lg">{webuiLaunch.currentAddress}</span>
          </motion.div>
        </>
      )}
      {/* Stop and terminate WebUi */}
      <motion.div
        animate={{backgroundColor: getBlack(0), transition: {duration: 0.5}}}
        whileHover={{backgroundColor: getBlack(0.2), transition: {duration: 0.5}}}
        whileTap={{scale: 0.7, backgroundColor: getBlack(0.4), borderRadius: '12px', transition: {duration: 0.1}}}
        onClick={handleStopWebUi}
        className="notDraggable hs-9 ml-1 flex w-9 rounded-md p-[1px]">
        <StopFilled className="notDraggable h-full w-full fill-black/70 dark:fill-white/90" />
      </motion.div>

      {/* Button to switch between Terminal and WebView */}
      {webuiLaunch.currentAddress !== '' && (
        <motion.div
          animate={{backgroundColor: getBlack(0), transition: {duration: 0.5}}}
          whileHover={{backgroundColor: getBlack(0.2), transition: {duration: 0.5}}}
          whileTap={{scale: 0.7, backgroundColor: getBlack(0.4), borderRadius: '12px', transition: {duration: 0.1}}}
          onClick={handlePageSwap}
          className="notDraggable ml-1 flex h-9 w-9 rounded-md p-[7px]">
          <SimpleArrow
            className={`notDraggable h-full w-full fill-black/70 transition duration-[400ms] dark:fill-white/90 ${
              webuiLaunch.currentView === 'webView' ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </motion.div>
      )}
    </div>
  );
}
