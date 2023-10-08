import React, {createContext, RefObject} from 'react';
import {WebviewTag} from 'electron';
import {WebuiList} from '../../AppState/AppConstants';

export interface StatusContextType {
  /* Window Managers */

  // Block background of an opened window to be not interactive
  blockBackground: boolean;
  setBlockBackground: React.Dispatch<React.SetStateAction<boolean>>;

  /* Install Manage */

  installedWebUi: WebuiList;
  setInstalledWebUi: React.Dispatch<React.SetStateAction<WebuiList>>;

  /* Running Manage */

  webuiRunning: boolean;
  setWebuiRunning: React.Dispatch<React.SetStateAction<boolean>>;

  webuiLaunch: {
    webViewRef: RefObject<WebviewTag>;
    currentView: 'terminal' | 'webView';
    currentAddress: string;
  };
  setWebuiLaunch: React.Dispatch<
    React.SetStateAction<{
      webViewRef: RefObject<WebviewTag>;
      currentView: 'terminal' | 'webView';
      currentAddress: string;
    }>
  >;

  /* Theme Objects */

  // Whether user theme is on dark mode
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const StatusContext = createContext<StatusContextType | null>(null);

export default StatusContext;
