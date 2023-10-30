import {ipcRenderer, IpcRendererEvent} from 'electron';
import {AppConfig, SDLaunchConfig, TGLaunchConfig} from '../../AppState/InterfaceAndTypes';

export const ipcWindowManager = {
  changeWindowState: (status: 'Minimize' | 'Maximize' | 'Close') => ipcRenderer.send('windowManager:changeWindowState', status),
  changeDarkMode: (status: 'Toggle' | 'System') => ipcRenderer.send('windowManager:changeDarkMode', status),
  getCurrentDarkMode: () => ipcRenderer.invoke('windowManager:getCurrentDarkMode'),
  // onDarkModeChange: (callback: (event: IpcRendererEvent, darkMode: boolean) => void) => ipcRenderer.on('windowManager:onDarkModeChange', callback),
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
};
