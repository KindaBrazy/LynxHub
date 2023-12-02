import {ipcRenderer, IpcRendererEvent} from 'electron';
import {AppConfig, DiscordRP, SDLaunchConfig, TGLaunchConfig} from '../../AppState/InterfaceAndTypes';

export const ipcWindowManager = {
  changeWindowState: (status: 'Minimize' | 'Maximize' | 'Close') => ipcRenderer.send('windowManager:changeWindowState', status),
  changeDarkMode: (status: 'toggle' | 'system' | 'dark' | 'light') => ipcRenderer.send('windowManager:changeDarkMode', status),
  appTaskbarStatus: (status: 'taskbarAndTray' | 'justTaskbar' | 'justTray' | 'trayWhenMinimized') =>
    ipcRenderer.send('windowManager:appTaskbarStatus', status),
  getThemeSource: () => ipcRenderer.invoke('windowManager:getThemeSource'),
  getIsDarkMode: () => ipcRenderer.invoke('windowManager:getIsDarkMode'),

  getTaskbarMode: () => ipcRenderer.invoke('windowManager:getTaskbarMode'),

  getWindowSize: () => ipcRenderer.invoke('windowManager:getWindowSize'),
  setWindowSize: (status: 'lastSize' | 'default') => ipcRenderer.send('windowManager:setWindowSize', status),

  getStartPage: () => ipcRenderer.invoke('windowManager:getStartPage'),
  setStartPage: (status: 'last' | 'image' | 'text' | 'audio') => ipcRenderer.send('windowManager:setStartPage', status),

  getLastPage: () => ipcRenderer.invoke('windowManager:getLastPage'),
  setLastPage: (pageId: number) => ipcRenderer.send('windowManager:setLastPage', pageId),

  getPageToShow: () => ipcRenderer.invoke('windowManager:getPageToShow'),

  getDiscordRp: () => ipcRenderer.invoke('windowManager:getDiscordRp'),
  setDiscordRp: (data: DiscordRP) => ipcRenderer.send('windowManager:setDiscordRp', data),

  setDiscordWebUIRunning: (status: {running: boolean; uiName: string}) => ipcRenderer.send('windowManager:setDiscordWebUIRunning', status),
  onDarkModeChange: (callback: (event: IpcRendererEvent, darkMode: boolean) => void) => ipcRenderer.on('windowManager:onDarkModeChange', callback),
};

export const ipcUtil = {
  openDialog: (option: 'openDirectory' | 'openFile') => ipcRenderer.invoke('util:openDialog', option),
  getAppPath: () => ipcRenderer.invoke('util:getAppPath'),
  setTaskbarProgress: (percent: number) => ipcRenderer.send('util:setTaskbarProgress', percent),
  cloneRepo: (uiName: string, dir: string) => ipcRenderer.invoke('util:cloneRepo', uiName, dir),
  getCloneProgress: (result: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('util:getCloneProgress', result),
  locateRepo: (uiName: string) => ipcRenderer.invoke('util:locateRepo', uiName),
};

export const ipcUserData = {
  modifyData: (op: 'save' | 'update' | 'load', updateData?: Partial<AppConfig>, saveOnUpdate?: boolean) =>
    ipcRenderer.send('userData:modifyData', op, updateData, saveOnUpdate),
  getUserData: () => ipcRenderer.invoke('userData:getUserData'),
  saveLaunchArgsToFile: (data: SDLaunchConfig | TGLaunchConfig, uiName: string) => ipcRenderer.send('userData:saveLaunchArgsToFile', data, uiName),
  getLaunchData: (uiName: string) => ipcRenderer.invoke('userData:getLaunchData', uiName),
  readLaunchDataFromFile: (uiName: string) => ipcRenderer.send('userData:readLaunchDataFromFile', uiName),
  onLaunchDataChange: (result: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('userData:onLaunchDataChange', result),
};

export const ipcBackendRuns = {
  ptyProcess: (operation: 'start' | 'stop', uiName: string) => ipcRenderer.invoke('backendRuns:ptyProcess', operation, uiName),
  getPtyOutput: (result: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('backendRuns:getPtyOutput', result),
  resizePty: (newSize: {cols: number; rows: number}) => ipcRenderer.send('backendRuns:resizePty', newSize),
  writeToPty: (data: string) => ipcRenderer.send('backendRuns:writeToPty', data),
};
